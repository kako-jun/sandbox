use anyhow::Result;
use image::{DynamicImage, GenericImageView};
use image_viewer::{ImageViewer, ImageViewerConfig};
use std::path::Path;
use tch::{Device, Tensor};
use std::process::Command;
use std::io::{self, Write};
use viu::{ImageSource, Printer};
use viuer::{print_from_path, Config};
use crate::args::OrientationMode;
use term_size::dimensions;
use std::time::SystemTime;
use chrono::{DateTime, Local};
use kamadak_exif::{self, In, Tag};
use anyhow::{Result, anyhow};

/// 画像の向きに関する判定結果を表す列挙型
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OrientationDecision {
    /// 元の向きを維持
    KeepOriginal,
    /// 90度回転
    Rotate90,
    /// 180度回転
    Rotate180,
    /// 270度回転
    Rotate270,
}

/// 画像の向きを検出・修正するための構造体
///
/// EXIF情報の解析、画像の向きの判定、ユーザーへの確認、
/// 画像の回転などの機能を提供します。
pub struct OrientationDetector {
    /// 前回の判定結果をキャッシュ
    last_decision: Option<OrientationDecision>,
    /// 前回の判定時刻
    last_decision_time: Option<DateTime<Local>>,
    /// キャッシュの有効期間（秒）
    cache_duration: i64,
}

impl OrientationDetector {
    /// 新しい `OrientationDetector` インスタンスを作成します
    ///
    /// # Returns
    /// デフォルトの設定で初期化された `OrientationDetector` インスタンス
    pub fn new() -> Self {
        Self {
            last_decision: None,
            last_decision_time: None,
            cache_duration: 300, // 5分
        }
    }

    /// キャッシュの有効期間を設定します
    ///
    /// # Arguments
    /// * `seconds` - キャッシュの有効期間（秒）
    pub fn set_cache_duration(&mut self, seconds: i64) {
        self.cache_duration = seconds;
    }

    /// 画像の向きを検出します
    ///
    /// EXIF情報を解析し、必要に応じてユーザーに確認を行います。
    /// キャッシュされた判定結果がある場合は、それを再利用します。
    ///
    /// # Arguments
    /// * `path` - 検出対象の画像ファイルパス
    ///
    /// # Returns
    /// 画像の向きに関する判定結果
    ///
    /// # Errors
    /// ファイルの読み込みやEXIF情報の解析に失敗した場合にエラーを返します
    pub fn detect_orientation(&mut self, path: &Path) -> Result<OrientationDecision> {
        // キャッシュの確認
        if let Some(decision) = self.check_cache() {
            return Ok(decision);
        }

        // EXIF情報の取得
        let orientation = self.get_exif_orientation(path)?;

        // 向きの判定
        let decision = match orientation {
            Some(1) => OrientationDecision::KeepOriginal,
            Some(3) => OrientationDecision::Rotate180,
            Some(6) => OrientationDecision::Rotate90,
            Some(8) => OrientationDecision::Rotate270,
            _ => self.ask_user(path)?,
        };

        // キャッシュの更新
        self.update_cache(decision);

        Ok(decision)
    }

    /// EXIF情報から画像の向きを取得します
    ///
    /// # Arguments
    /// * `path` - 画像ファイルパス
    ///
    /// # Returns
    /// EXIFの向き情報（1, 3, 6, 8）または `None`
    ///
    /// # Errors
    /// ファイルの読み込みやEXIF情報の解析に失敗した場合にエラーを返します
    fn get_exif_orientation(&self, path: &Path) -> Result<Option<u32>> {
        let file = std::fs::File::open(path)?;
        let mut bufreader = std::io::BufReader::new(file);
        let exif = kamadak_exif::Reader::new()
            .read_from_container(&mut bufreader)
            .ok();

        if let Some(exif) = exif {
            if let Some(orientation) = exif.get_field(Tag::Orientation) {
                if let In::SHORT(value) = orientation.value {
                    if let Some(&v) = value.first() {
                        return Ok(Some(v as u32));
                    }
                }
            }
        }

        Ok(None)
    }

    /// ユーザーに画像の向きを確認します
    ///
    /// 画像をターミナルに表示し、ユーザーに適切な向きを選択させます。
    ///
    /// # Arguments
    /// * `path` - 確認対象の画像ファイルパス
    ///
    /// # Returns
    /// ユーザーが選択した向きの判定結果
    ///
    /// # Errors
    /// ファイルの読み込みや表示に失敗した場合にエラーを返します
    fn ask_user(&self, path: &Path) -> Result<OrientationDecision> {
        // 画像の表示
        self.display_image(path)?;

        // 選択肢の表示
        println!("\n画像の向きを選択してください:");
        println!("1. 現在の向きを維持");
        println!("2. 90度回転");
        println!("3. 180度回転");
        println!("4. 270度回転");

        // ユーザー入力の取得
        loop {
            print!("選択 (1-4): ");
            io::stdout().flush()?;

            let mut input = String::new();
            io::stdin().read_line(&mut input)?;

            match input.trim() {
                "1" => return Ok(OrientationDecision::KeepOriginal),
                "2" => return Ok(OrientationDecision::Rotate90),
                "3" => return Ok(OrientationDecision::Rotate180),
                "4" => return Ok(OrientationDecision::Rotate270),
                _ => println!("無効な選択です。1から4の数字を入力してください。"),
            }
        }
    }

    /// 画像をターミナルに表示します
    ///
    /// # Arguments
    /// * `path` - 表示対象の画像ファイルパス
    ///
    /// # Errors
    /// ファイルの読み込みや表示に失敗した場合にエラーを返します
    fn display_image(&self, path: &Path) -> Result<()> {
        // ターミナルのサイズを取得
        let (term_width, term_height) = term_size::dimensions()
            .ok_or_else(|| anyhow!("ターミナルのサイズを取得できません"))?;

        // 画像の表示設定
        let config = Config {
            width: Some(term_width),
            height: Some(term_height - 10), // 選択肢の表示用に余白を確保
            ..Default::default()
        };

        // 画像の表示
        print_from_path(path, &config)
            .map_err(|e| anyhow!("画像の表示に失敗: {}", e))?;

        Ok(())
    }

    /// キャッシュされた判定結果を確認します
    ///
    /// # Returns
    /// 有効なキャッシュがある場合は判定結果、ない場合は `None`
    fn check_cache(&self) -> Option<OrientationDecision> {
        if let (Some(decision), Some(last_time)) = (self.last_decision, self.last_decision_time) {
            let now = Local::now();
            let duration = now.signed_duration_since(last_time);
            if duration.num_seconds() < self.cache_duration {
                return Some(decision);
            }
        }
        None
    }

    /// 判定結果をキャッシュに保存します
    ///
    /// # Arguments
    /// * `decision` - 保存する判定結果
    fn update_cache(&mut self, decision: OrientationDecision) {
        self.last_decision = Some(decision);
        self.last_decision_time = Some(Local::now());
    }

    /// 画像を指定された向きに回転させます
    ///
    /// # Arguments
    /// * `img` - 回転対象の画像
    /// * `decision` - 適用する回転の種類
    ///
    /// # Returns
    /// 回転後の画像
    pub fn rotate_image(&self, img: DynamicImage, decision: OrientationDecision) -> DynamicImage {
        match decision {
            OrientationDecision::KeepOriginal => img,
            OrientationDecision::Rotate90 => img.rotate90(),
            OrientationDecision::Rotate180 => img.rotate180(),
            OrientationDecision::Rotate270 => img.rotate270(),
        }
    }
} 
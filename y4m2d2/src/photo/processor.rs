use std::path::{Path, PathBuf};
use std::sync::Arc;
use rayon::prelude::*;
use chrono::{DateTime, Local};
use anyhow::Result;
use crate::args::Args;
use crate::error::PhotoRenamerError;
use crate::utils::fs::FileSystem;
use crate::photo::orientation::{OrientationDetector, OrientationDecision};
use crate::ui::display::Display;

/// メディアファイルの処理を管理する構造体
///
/// 画像の向きの検出・修正、ファイルの移動、バックアップの作成などの
/// 処理を提供します。
pub struct MediaProcessor {
    /// ファイルシステム操作を管理するインスタンス
    fs: Arc<FileSystem>,
    /// 画像の向きを検出するインスタンス
    orientation_detector: OrientationDetector,
    /// ユーザーインターフェースの表示を管理するインスタンス
    display: Display,
    /// コマンドライン引数
    args: Args,
}

impl MediaProcessor {
    /// 新しい `MediaProcessor` インスタンスを作成します
    ///
    /// # Arguments
    /// * `args` - コマンドライン引数
    ///
    /// # Returns
    /// 初期化された `MediaProcessor` インスタンス
    pub fn new(args: Args) -> Self {
        Self {
            fs: Arc::new(FileSystem::new()),
            orientation_detector: OrientationDetector::new(),
            display: Display::new(),
            args,
        }
    }

    /// メディアファイルの処理を開始します
    ///
    /// # Returns
    /// 処理結果。エラーがある場合は `Err` を返します
    pub fn process(&mut self) -> Result<()> {
        // メディアファイルの検索
        let files = self.fs.find_all_media_files(&self.args.input_dir)?;
        if files.is_empty() {
            return Err(PhotoRenamerError::NoMediaFiles.into());
        }

        // 進捗表示の初期化
        self.display.set_total_files(files.len());

        // ファイルの処理
        files.par_iter().try_for_each(|file| {
            self.process_file(file)?;
            Ok(())
        })?;

        // 処理完了の表示
        self.display.finish(files.len());

        Ok(())
    }

    /// 個々のファイルを処理します
    ///
    /// # Arguments
    /// * `file` - 処理対象のファイルパス
    ///
    /// # Returns
    /// 処理結果。エラーがある場合は `Err` を返します
    fn process_file(&mut self, file: &Path) -> Result<()> {
        // 進捗表示の更新
        self.display.update_progress(file.to_str().unwrap_or("不明なファイル"));

        // 出力パスの生成
        let output_path = self.generate_output_path(file)?;

        // バックアップの作成
        if let Some(ref backup_dir) = self.args.backup_dir {
            self.fs.create_backup(file, backup_dir)?;
        }

        // 画像の向きの検出と修正
        if self.fs.is_image_file(file) {
            let decision = self.orientation_detector.detect_orientation(file)?;
            if decision != OrientationDecision::KeepOriginal {
                self.rotate_and_save_image(file, &output_path, decision)?;
                return Ok(());
            }
        }

        // ファイルの移動
        self.fs.rename_file(file, &output_path)?;

        Ok(())
    }

    /// 出力パスを生成します
    ///
    /// # Arguments
    /// * `file` - 元のファイルパス
    ///
    /// # Returns
    /// 生成された出力パス
    ///
    /// # Errors
    /// パスの生成に失敗した場合にエラーを返します
    fn generate_output_path(&self, file: &Path) -> Result<PathBuf> {
        let file_name = file.file_name()
            .ok_or_else(|| PhotoRenamerError::InvalidPath("ファイル名が取得できません".into()))?;

        let date = self.get_file_date(file)?;
        let date_dir = self.args.output_dir.join(date.format("%Y").to_string())
            .join(date.format("%Y-%m").to_string())
            .join(date.format("%Y-%m-%d").to_string());

        Ok(date_dir.join(file_name))
    }

    /// ファイルの日付を取得します
    ///
    /// # Arguments
    /// * `file` - 対象のファイルパス
    ///
    /// # Returns
    /// ファイルの日付
    ///
    /// # Errors
    /// 日付の取得に失敗した場合にエラーを返します
    fn get_file_date(&self, file: &Path) -> Result<DateTime<Local>> {
        let metadata = std::fs::metadata(file)?;
        let modified = metadata.modified()?;
        let datetime: DateTime<Local> = modified.into();
        Ok(datetime)
    }

    /// 画像を回転して保存します
    ///
    /// # Arguments
    /// * `src` - 元の画像ファイルパス
    /// * `dst` - 保存先のパス
    /// * `decision` - 適用する回転の種類
    ///
    /// # Errors
    /// 画像の処理に失敗した場合にエラーを返します
    fn rotate_and_save_image(&self, src: &Path, dst: &Path, decision: OrientationDecision) -> Result<()> {
        // 画像の読み込み
        let img = image::open(src)?;

        // 画像の回転
        let rotated = self.orientation_detector.rotate_image(img, decision);

        // 出力ディレクトリの作成
        if let Some(parent) = dst.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // 画像の保存
        rotated.save(dst)?;

        Ok(())
    }
} 
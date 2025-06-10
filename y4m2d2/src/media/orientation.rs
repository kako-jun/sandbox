use anyhow::Result;
use std::path::Path;
use std::io::{self, Write};
use viuer::{print_from_path, Config};
use image::{self, DynamicImage, GenericImageView};
use crate::args::OrientationMode;
use kamadak_exif::{self, Tag};

/// 写真の向きを表す列挙型
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OrientationDecision {
    /// 元の向きを保持
    KeepOriginal,
    /// 90度回転
    Rotate90,
    /// 180度回転
    Rotate180,
    /// 270度回転
    Rotate270,
}

/// 写真の向きを検出するための構造体
pub struct OrientationDetector {
    mode: OrientationMode,
    global_decision: Option<OrientationDecision>,
}

impl OrientationDetector {
    /// 新しいOrientationDetectorインスタンスを作成します
    ///
    /// # Arguments
    ///
    /// * `mode` - 向き検出のモード（自動、保持、対話）
    ///
    /// # Returns
    ///
    /// 新しいOrientationDetectorインスタンス
    pub fn new(mode: OrientationMode) -> Self {
        Self {
            mode,
            global_decision: None,
        }
    }

    /// 写真の向きを検出します
    ///
    /// # Arguments
    ///
    /// * `image_path` - 画像ファイルのパス
    ///
    /// # Returns
    ///
    /// * `Ok(OrientationDecision)` - 検出された向き
    /// * `Err` - ファイルの読み込みやEXIFデータの解析に失敗した場合
    pub fn detect_orientation(&mut self, image_path: &Path) -> Result<OrientationDecision> {
        match self.mode {
            OrientationMode::Auto => {
                let img = image::open(image_path)?;
                let exif = self.get_exif_orientation(image_path)?;
                Ok(self.get_orientation_from_exif(exif))
            }
            OrientationMode::Keep => {
                Ok(OrientationDecision::KeepOriginal)
            }
            OrientationMode::Interactive => {
                if let Some(decision) = self.global_decision {
                    Ok(decision)
                } else {
                    let decision = self.ask_user(image_path)?;
                    self.global_decision = Some(decision);
                    Ok(decision)
                }
            }
        }
    }

    /// EXIFデータから向き情報を取得します
    ///
    /// # Arguments
    ///
    /// * `image_path` - 画像ファイルのパス
    ///
    /// # Returns
    ///
    /// * `Ok(Option<u32>)` - EXIFの向き情報（1-8）またはNone
    /// * `Err` - ファイルの読み込みやEXIFデータの解析に失敗した場合
    fn get_exif_orientation(&self, image_path: &Path) -> Result<Option<u32>> {
        let file = std::fs::File::open(image_path)?;
        let mut bufreader = std::io::BufReader::new(file);
        let exif = kamadak_exif::Reader::new()
            .read_from_container(&mut bufreader)
            .ok();

        if let Some(exif) = exif {
            if let Some(orientation) = exif.get_field(exif::Tag::Orientation) {
                if let exif::Value::Short(value) = orientation.value {
                    if let Some(&v) = value.first() {
                        return Ok(Some(v as u32));
                    }
                }
            }
        }

        Ok(None)
    }

    /// EXIFの向き情報からOrientationDecisionを生成します
    ///
    /// # Arguments
    ///
    /// * `orientation` - EXIFの向き情報（1-8）またはNone
    ///
    /// # Returns
    ///
    /// 対応するOrientationDecision
    fn get_orientation_from_exif(&self, orientation: Option<u32>) -> OrientationDecision {
        match orientation {
            Some(1) => OrientationDecision::KeepOriginal,
            Some(2) => OrientationDecision::Rotate180, // 水平反転
            Some(3) => OrientationDecision::Rotate180,
            Some(4) => OrientationDecision::Rotate180, // 垂直反転
            Some(5) => OrientationDecision::Rotate90,  // 90度回転して水平反転
            Some(6) => OrientationDecision::Rotate90,
            Some(7) => OrientationDecision::Rotate270, // 270度回転して水平反転
            Some(8) => OrientationDecision::Rotate270,
            _ => OrientationDecision::KeepOriginal,
        }
    }

    /// ユーザーに写真の向きを確認します
    ///
    /// # Arguments
    ///
    /// * `image_path` - 画像ファイルのパス
    ///
    /// # Returns
    ///
    /// * `Ok(OrientationDecision)` - ユーザーが選択した向き
    /// * `Err` - ユーザー入力の読み込みに失敗した場合
    fn ask_user(&self, image_path: &Path) -> Result<OrientationDecision> {
        // ... 既存のコード ...
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_orientation_mode() {
        let detector = OrientationDetector::new(OrientationMode::Auto);
        assert!(!detector.needs_interaction());

        let detector = OrientationDetector::new(OrientationMode::Keep);
        assert!(!detector.needs_interaction());

        let detector = OrientationDetector::new(OrientationMode::Interactive);
        assert!(detector.needs_interaction());
    }

    #[test]
    fn test_cache_duration() {
        let mut detector = OrientationDetector::new(OrientationMode::Auto);
        detector.set_cache_duration(std::time::Duration::from_secs(3600));
        // キャッシュの有効期限が設定されたことを確認
        assert_eq!(detector.cache_duration, std::time::Duration::from_secs(3600));
    }

    #[test]
    fn test_orientation_decision() {
        assert_eq!(OrientationDecision::Keep.to_string(), "Keep");
        assert_eq!(OrientationDecision::Rotate90.to_string(), "Rotate90");
        assert_eq!(OrientationDecision::Rotate180.to_string(), "Rotate180");
        assert_eq!(OrientationDecision::Rotate270.to_string(), "Rotate270");
        assert_eq!(OrientationDecision::FlipHorizontal.to_string(), "FlipHorizontal");
        assert_eq!(OrientationDecision::FlipVertical.to_string(), "FlipVertical");
    }

    #[test]
    fn test_cache_operations() {
        let temp_dir = TempDir::new().unwrap();
        let test_file = temp_dir.path().join("test.jpg");
        fs::write(&test_file, "dummy image data").unwrap();

        let mut detector = OrientationDetector::new(OrientationMode::Auto);
        
        // キャッシュの更新と取得をテスト
        detector.update_cache(&test_file, OrientationDecision::Rotate90);
        let cached = detector.check_cache(&test_file);
        assert_eq!(cached, Some(OrientationDecision::Rotate90));

        // 存在しないファイルのキャッシュをテスト
        let non_existent = temp_dir.path().join("non_existent.jpg");
        let cached = detector.check_cache(&non_existent);
        assert_eq!(cached, None);
    }
} 
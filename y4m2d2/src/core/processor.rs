use anyhow::Result;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use chrono::{DateTime, Local};
use rayon::prelude::*;
use crate::media::{PhotoDate, VideoDate, OrientationDetector, OrientationDecision};
use crate::utils::fs::FileSystem;
use crate::ui::display::Display;

/// メディアファイルの処理を管理する構造体
///
/// 画像の向きの検出・修正、ファイルの移動、バックアップの作成などの
/// 処理を提供します。
pub struct MediaProcessor {
    fs: FileSystem,
    photo_date: PhotoDate,
    video_date: VideoDate,
    orientation_detector: OrientationDetector,
    display: Display,
    orientation_cache: Arc<Mutex<Option<OrientationDecision>>>,
}

impl MediaProcessor {
    /// 新しい `MediaProcessor` インスタンスを作成します
    ///
    /// # Arguments
    /// * `orientation_mode` - 画像の向きの処理モード
    ///
    /// # Returns
    /// 初期化された `MediaProcessor` インスタンス
    pub fn new(orientation_mode: crate::args::OrientationMode) -> Self {
        Self {
            fs: FileSystem::new(),
            photo_date: PhotoDate::new(),
            video_date: VideoDate::new(),
            orientation_detector: OrientationDetector::new(orientation_mode),
            display: Display::new(),
            orientation_cache: Arc::new(Mutex::new(None)),
        }
    }

    /// ディレクトリ内のメディアファイルを処理します
    ///
    /// # Arguments
    /// * `dir` - 処理対象のディレクトリパス
    /// * `output_dir` - 出力先のディレクトリパス
    ///
    /// # Returns
    /// 処理結果。エラーがある場合は `Err` を返します
    pub fn process_directory(&mut self, dir: &Path, output_dir: Option<&Path>) -> Result<()> {
        let files = self.fs.find_all_media_files(dir)?;
        self.display.set_total_files(files.len());

        let (interactive_files, parallel_files) = self.separate_files_by_processing_type(&files);
        self.process_interactive_files(&interactive_files, output_dir)?;
        self.process_parallel_files(&parallel_files, output_dir)?;

        self.display.finish();
        Ok(())
    }

    /// ファイルを処理タイプに応じて分類します
    ///
    /// # Arguments
    /// * `files` - 分類対象のファイルパスのベクター
    ///
    /// # Returns
    /// 対話処理が必要なファイルと並列処理可能なファイルのタプル
    fn separate_files_by_processing_type(&self, files: &[PathBuf]) -> (Vec<PathBuf>, Vec<PathBuf>) {
        files.iter()
            .cloned()
            .partition(|f| self.needs_interaction(f))
    }

    /// 対話処理が必要なファイルを処理します
    ///
    /// # Arguments
    /// * `files` - 処理対象のファイルパスのベクター
    /// * `output_dir` - 出力先のディレクトリパス
    ///
    /// # Returns
    /// 処理結果。エラーがある場合は `Err` を返します
    fn process_interactive_files(&mut self, files: &[PathBuf], output_dir: Option<&Path>) -> Result<()> {
        for file in files {
            self.process_file(file, output_dir)?;
        }
        Ok(())
    }

    /// 並列処理可能なファイルを処理します
    ///
    /// # Arguments
    /// * `files` - 処理対象のファイルパスのベクター
    /// * `output_dir` - 出力先のディレクトリパス
    fn process_parallel_files(&self, files: &[PathBuf], output_dir: Option<&Path>) {
        if !files.is_empty() {
            files.par_iter().for_each(|file| {
                if let Err(e) = self.process_file(file, output_dir) {
                    eprintln!("エラー: {} - {}", file.display(), e);
                }
            });
        }
    }

    /// ファイルの処理タイプを判定します
    ///
    /// # Arguments
    /// * `file` - 判定対象のファイルパス
    ///
    /// # Returns
    /// 対話処理が必要な場合は `true`、そうでない場合は `false`
    fn needs_interaction(&self, file: &Path) -> bool {
        self.fs.is_image_file(file) && self.orientation_detector.needs_interaction()
    }

    /// 個々のファイルを処理します
    ///
    /// # Arguments
    /// * `file` - 処理対象のファイルパス
    /// * `output_dir` - 出力先のディレクトリパス
    ///
    /// # Returns
    /// 処理結果。エラーがある場合は `Err` を返します
    pub fn process_file(&mut self, file: &Path, output_dir: Option<&Path>) -> Result<()> {
        let date = self.get_file_date(file)?;
        let orientation = self.get_file_orientation(file)?;
        let new_name = self.generate_filename(file, date, orientation)?;
        let target_path = self.get_target_path(file, output_dir, &new_name)?;

        self.fs.rename_file(file, &target_path)?;
        self.display.update_progress(&format!(
            "{} -> {}",
            file.file_name().unwrap().to_string_lossy(),
            new_name
        ));

        Ok(())
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
        if self.fs.is_video_file(file) {
            self.video_date.get_video_date(file)
        } else {
            self.photo_date.get_date(file)
        }
    }

    /// ファイルの向きを取得します
    ///
    /// # Arguments
    /// * `file` - 対象のファイルパス
    ///
    /// # Returns
    /// ファイルの向きに関する判定結果
    ///
    /// # Errors
    /// 向きの取得に失敗した場合にエラーを返します
    fn get_file_orientation(&self, file: &Path) -> Result<OrientationDecision> {
        if self.needs_interaction(file) {
            self.orientation_detector.detect_orientation(file)
        } else {
            self.get_cached_orientation(file)
        }
    }

    /// キャッシュされた向きを取得します
    ///
    /// # Arguments
    /// * `file` - 対象のファイルパス
    ///
    /// # Returns
    /// キャッシュされた向きの判定結果
    ///
    /// # Errors
    /// 向きの取得に失敗した場合にエラーを返します
    fn get_cached_orientation(&self, file: &Path) -> Result<OrientationDecision> {
        if let Some(cached) = *self.orientation_cache.lock().unwrap() {
            Ok(cached)
        } else {
            let decision = self.orientation_detector.detect_orientation(file)?;
            *self.orientation_cache.lock().unwrap() = Some(decision);
            Ok(decision)
        }
    }

    /// 新しいファイル名を生成します
    ///
    /// # Arguments
    /// * `file` - 元のファイルパス
    /// * `date` - ファイルの日付
    /// * `orientation` - ファイルの向き
    ///
    /// # Returns
    /// 生成されたファイル名
    ///
    /// # Errors
    /// ファイル名の生成に失敗した場合にエラーを返します
    fn generate_filename(&self, file: &Path, date: DateTime<Local>, orientation: OrientationDecision) -> Result<String> {
        let ext = file.extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        let date_str = date.format("%Y%m%d_%H%M%S").to_string();
        let orientation_suffix = self.get_orientation_suffix(orientation);

        Ok(format!("{}{}.{}", date_str, orientation_suffix, ext))
    }

    /// 向きに応じたサフィックスを取得します
    ///
    /// # Arguments
    /// * `orientation` - ファイルの向き
    ///
    /// # Returns
    /// 向きに応じたサフィックス
    fn get_orientation_suffix(&self, orientation: OrientationDecision) -> &'static str {
        match orientation {
            OrientationDecision::KeepOriginal => "",
            OrientationDecision::Rotate90 => "_r90",
            OrientationDecision::Rotate180 => "_r180",
            OrientationDecision::Rotate270 => "_r270",
        }
    }

    /// 出力先のパスを生成します
    ///
    /// # Arguments
    /// * `file` - 元のファイルパス
    /// * `output_dir` - 出力先のディレクトリパス
    /// * `new_name` - 新しいファイル名
    ///
    /// # Returns
    /// 出力先のパス
    ///
    /// # Errors
    /// パスの生成に失敗した場合にエラーを返します
    fn get_target_path(&self, file: &Path, output_dir: Option<&Path>, new_name: &str) -> Result<PathBuf> {
        let target_dir = output_dir.unwrap_or_else(|| file.parent().unwrap());
        Ok(target_dir.join(new_name))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_process_directory() {
        let temp_dir = TempDir::new().unwrap();
        let input_dir = temp_dir.path().join("input");
        let output_dir = temp_dir.path().join("output");
        fs::create_dir_all(&input_dir).unwrap();
        fs::create_dir_all(&output_dir).unwrap();

        // テスト用の画像ファイルを作成
        let test_file = input_dir.join("test.jpg");
        fs::write(&test_file, "dummy image data").unwrap();

        let mut processor = MediaProcessor::new(OrientationMode::Keep);
        let result = processor.process_directory(&input_dir, Some(&output_dir));
        assert!(result.is_ok());
    }

    #[test]
    fn test_needs_interaction() {
        let processor = MediaProcessor::new(OrientationMode::Interactive);
        assert!(processor.needs_interaction());

        let processor = MediaProcessor::new(OrientationMode::Keep);
        assert!(!processor.needs_interaction());

        let processor = MediaProcessor::new(OrientationMode::Auto);
        assert!(!processor.needs_interaction());
    }

    #[test]
    fn test_generate_filename() {
        let processor = MediaProcessor::new(OrientationMode::Keep);
        let date = chrono::NaiveDateTime::parse_from_str(
            "2024-02-14 12:34:56",
            "%Y-%m-%d %H:%M:%S",
        )
        .unwrap();
        let filename = processor.generate_filename(&date, "jpg", 1);
        assert_eq!(filename, "2024-02-14_123456_001.jpg");
    }

    #[test]
    fn test_get_orientation_suffix() {
        let processor = MediaProcessor::new(OrientationMode::Keep);
        assert_eq!(processor.get_orientation_suffix(1), "");
        assert_eq!(processor.get_orientation_suffix(2), "_h");
        assert_eq!(processor.get_orientation_suffix(3), "_180");
        assert_eq!(processor.get_orientation_suffix(4), "_v");
        assert_eq!(processor.get_orientation_suffix(5), "_90");
        assert_eq!(processor.get_orientation_suffix(6), "_90");
        assert_eq!(processor.get_orientation_suffix(7), "_270");
        assert_eq!(processor.get_orientation_suffix(8), "_270");
    }
} 
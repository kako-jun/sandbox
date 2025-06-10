use anyhow::{Context, Result};
use chrono::{DateTime, Local, Timelike};
use std::collections::HashMap;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::time::Instant;

use crate::photo::date::PhotoDate;
use crate::photo::preview::{DateSource, RenamePreview};
use crate::utils::fs::{FileSystem, FileState, DirectoryState, BurstPhotoFolder};
use crate::utils::{ProgressBar, clear_progress};
use crate::photo::video::VideoDate;
use crate::utils::logger::Logger;
use crate::photo::orientation::{OrientationDetector, OrientationDecision};
use crate::args::OrientationMode;

pub struct PhotoRenamer {
    fs: FileSystem,
    photo_date: PhotoDate,
    video_date: VideoDate,
    logger: Logger,
    orientation_detector: OrientationDetector,
}

#[derive(Debug)]
pub struct FilePreview {
    pub preview: RenamePreview,
    pub state: FileState,
}

#[derive(Debug)]
pub struct DirectoryPreview {
    pub input_state: DirectoryState,
    pub output_state: DirectoryState,
    pub files: Vec<FilePreview>,
    pub errors: Vec<(PathBuf, String)>,
}

impl PhotoRenamer {
    pub fn new(orientation_mode: OrientationMode) -> Self {
        Self {
            fs: FileSystem::new(),
            photo_date: PhotoDate::new(),
            video_date: VideoDate::new(),
            logger: Logger::new(Path::new("logs"))?,
            orientation_detector: OrientationDetector::new(orientation_mode),
        }
    }

    pub fn preview_directory(&self, dir: &Path, output_dir: Option<&Path>) -> Result<DirectoryPreview> {
        let output_path = self.fs.create_output_dir(dir, output_dir)?;
        let input_state = self.fs.get_directory_state(dir)?;
        let output_state = self.fs.get_directory_state(&output_path)?;

        let mut files = Vec::new();
        let mut errors = Vec::new();

        for path in self.fs.find_all_media_files(dir)? {
            match self.preview_file(&path, &output_path) {
                Ok(preview) => files.push(preview),
                Err(e) => errors.push((path, e.to_string())),
            }
        }

        Ok(DirectoryPreview {
            input_state,
            output_state,
            files,
            errors,
        })
    }

    fn format_datetime(&self, date: &DateTime<Local>) -> String {
        let base = date.format("%Y-%m-%d_%H-%M-%S").to_string();
        if date.nanosecond() > 0 {
            format!("{}-{:03}", base, date.nanosecond() / 1_000_000)
        } else {
            base
        }
    }

    fn preview_file(&self, path: &Path, output_dir: &Path) -> Result<FilePreview> {
        let state = self.fs.get_file_state(path)?;
        let date = if self.fs.is_video_file(path) {
            self.video_date.get_video_date(path)?
        } else {
            self.photo_date.get_photo_date(path)?
        };

        // 連続撮影フォルダ内の写真かどうかを判定
        let burst_index = if let Some(parent) = path.parent() {
            if let Some(burst_folder) = self.fs.get_burst_photo_folder(parent)? {
                burst_folder.photos.iter().position(|p| p == path)
            } else {
                None
            }
        } else {
            None
        };

        let new_name = if let Some(index) = burst_index {
            format!(
                "{}_burst{:03}.{}",
                self.format_datetime(&date),
                index + 1,
                path.extension().unwrap().to_str().unwrap()
            )
        } else {
            format!(
                "{}.{}",
                self.format_datetime(&date),
                path.extension().unwrap().to_str().unwrap()
            )
        };

        // 日付ベースのディレクトリパスを生成
        let date_dir = self.fs.create_date_based_path(output_dir, date)?;
        let new_path = date_dir.join(new_name);

        Ok(FilePreview {
            preview: RenamePreview {
                original_path: path.to_path_buf(),
                new_path,
                date,
                source: if self.fs.is_video_file(path) { "Video Metadata" } else { "EXIF" }.to_string(),
                burst_index,
            },
            state,
        })
    }

    pub fn process_directory(&mut self, dir: &Path, output_dir: Option<&Path>) -> Result<()> {
        let files = self.fs.find_all_media_files(dir)?;
        self.fs.set_total_files(files.len());

        for file in files {
            let date = self.photo_date.get_date(&file)?;
            let orientation = self.orientation_detector.detect_orientation(&file)?;

            let new_name = self.generate_filename(&file, date, orientation)?;
            let target_dir = output_dir.unwrap_or_else(|| file.parent().unwrap());
            let target_path = target_dir.join(new_name);

            self.fs.rename_file(&file, &target_path)?;
            self.fs.update_progress(&format!(
                "{} -> {}",
                file.file_name().unwrap().to_string_lossy(),
                new_name
            ));
        }

        Ok(())
    }

    fn generate_filename(&self, file: &Path, date: DateTime<Local>, orientation: OrientationDecision) -> Result<String> {
        let ext = file.extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        let date_str = date.format("%Y%m%d_%H%M%S").to_string();
        let orientation_suffix = match orientation {
            OrientationDecision::KeepOriginal => "",
            OrientationDecision::Rotate90 => "_r90",
            OrientationDecision::Rotate180 => "_r180",
            OrientationDecision::Rotate270 => "_r270",
        };

        Ok(format!("{}{}.{}", date_str, orientation_suffix, ext))
    }

    pub fn cleanup_output_dir(&self, output_dir: &Path) -> Result<()> {
        self.fs.cleanup_output_dir(output_dir)?;
        println!("出力ディレクトリを削除しました: {}", output_dir.display());
        Ok(())
    }

    fn count_image_files(&self, dir: &Path) -> Result<usize> {
        Ok(self.fs.find_all_image_files(dir)?.len())
    }

    pub fn interactive_mode(&self) -> Result<()> {
        println!("写真リネームツール - 対話モード");
        println!("サポートされている形式: .jpg, .jpeg, .png, .gif");

        loop {
            print!("\n処理する写真が含まれるディレクトリのパスを入力してください（終了するには 'q' を入力）: ");
            io::stdout().flush()?;

            let mut input = String::new();
            io::stdin().read_line(&mut input)?;
            let dir_path = input.trim();

            if dir_path.to_lowercase() == "q" {
                break;
            }

            let dir_path = Path::new(dir_path);
            if !dir_path.exists() || !dir_path.is_dir() {
                println!("エラー: 指定されたディレクトリが存在しません。");
                continue;
            }

            print!("出力先ディレクトリのパスを入力してください（デフォルトの場合はEnter）: ");
            io::stdout().flush()?;

            let mut output_path = String::new();
            io::stdin().read_line(&mut output_path)?;
            let output_path = output_path.trim();

            print!("ファイル名のプレフィックスを入力してください（デフォルトの場合はEnter）: ");
            io::stdout().flush()?;

            let mut prefix = String::new();
            io::stdin().read_line(&mut prefix)?;
            let prefix = prefix.trim();

            let output_dir = if output_path.is_empty() {
                None
            } else {
                Some(Path::new(output_path))
            };

            // プレビュー表示
            if let Err(e) = self.process_directory(
                dir_path,
                output_dir.clone(),
                if prefix.is_empty() { None } else { Some(prefix) },
                true,
            ) {
                println!("エラー: {}", e);
                continue;
            }

            print!("\nこの内容でリネームを実行しますか？ (y/n): ");
            io::stdout().flush()?;

            let mut confirm = String::new();
            io::stdin().read_line(&mut confirm)?;
            if confirm.trim().to_lowercase() != "y" {
                println!("リネームをキャンセルしました。");
                continue;
            }

            if let Err(e) = self.process_directory(
                dir_path,
                output_dir,
                if prefix.is_empty() { None } else { Some(prefix) },
                false,
            ) {
                println!("エラー: {}", e);
            }
        }

        Ok(())
    }
}

fn format_duration(duration: std::time::Duration) -> String {
    let seconds = duration.as_secs();
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let seconds = seconds % 60;

    if hours > 0 {
        format!("{}時間{}分{}秒", hours, minutes, seconds)
    } else if minutes > 0 {
        format!("{}分{}秒", minutes, seconds)
    } else {
        format!("{}秒", seconds)
    }
} 
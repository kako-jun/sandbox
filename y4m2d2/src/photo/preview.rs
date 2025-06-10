use chrono::DateTime;
use chrono::Local;
use std::path::PathBuf;

#[derive(Debug)]
pub enum DateSource {
    Exif,
    Filename,
    CreationTime,
    CurrentTime,
}

impl DateSource {
    pub fn to_string(&self) -> &'static str {
        match self {
            DateSource::Exif => "EXIF",
            DateSource::Filename => "ファイル名",
            DateSource::CreationTime => "作成日時",
            DateSource::CurrentTime => "現在時刻",
        }
    }

    pub fn color_code(&self) -> &'static str {
        match self {
            DateSource::Exif => "\x1b[32m", // 緑色
            DateSource::Filename => "\x1b[33m", // 黄色
            DateSource::CreationTime => "\x1b[35m", // マゼンタ
            DateSource::CurrentTime => "\x1b[31m", // 赤色
        }
    }
}

#[derive(Debug)]
pub struct RenamePreview {
    pub original_path: PathBuf,
    pub new_path: PathBuf,
    pub date: Option<DateTime<Local>>,
    pub date_source: DateSource,
    pub error: Option<String>,
}

impl RenamePreview {
    pub fn new(
        original_path: PathBuf,
        new_path: PathBuf,
        date: Option<DateTime<Local>>,
        date_source: DateSource,
    ) -> Self {
        Self {
            original_path,
            new_path,
            date,
            date_source,
            error: None,
        }
    }

    pub fn with_error(
        original_path: PathBuf,
        new_path: PathBuf,
        date: Option<DateTime<Local>>,
        date_source: DateSource,
        error: String,
    ) -> Self {
        Self {
            original_path,
            new_path,
            date,
            date_source,
            error: Some(error),
        }
    }

    pub fn display(&self) -> String {
        let date_str = self.date
            .map(|d| d.format("%Y-%m-%d %H:%M:%S").to_string())
            .unwrap_or_else(|| "不明".to_string());

        let source_color = self.date_source.color_code();
        let reset_color = "\x1b[0m";
        let error_color = "\x1b[31m"; // 赤色

        let status = if let Some(error) = &self.error {
            format!("{}エラー: {}{}", error_color, error, reset_color)
        } else {
            format!("{}成功{}", source_color, reset_color)
        };

        format!(
            "{} -> {}\n  日時: {} (取得元: {}{}{})\n  状態: {}",
            self.original_path.display(),
            self.new_path.display(),
            date_str,
            source_color,
            self.date_source.to_string(),
            reset_color,
            status
        )
    }
} 
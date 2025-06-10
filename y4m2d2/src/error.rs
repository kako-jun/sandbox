use std::path::PathBuf;
use thiserror::Error;
use chrono::{DateTime, Local};

#[derive(Error, Debug)]
pub enum PhotoRenamerError {
    #[error("ファイル操作エラー: {0}")]
    FileOperation(#[from] std::io::Error),

    #[error("EXIFデータの読み取りエラー: {0}")]
    ExifError(#[from] kamadak_exif::Error),

    #[error("画像処理エラー: {0}")]
    ImageError(#[from] image::ImageError),

    #[error("FFmpegエラー: {0}")]
    FFmpegError(#[from] ffmpeg_next::Error),

    #[error("日付解析エラー: {0}")]
    DateParseError(String),

    #[error("メタデータが見つかりません: {0}")]
    MetadataNotFound(PathBuf),

    #[error("無効なファイル形式: {0}")]
    InvalidFileFormat(String),

    #[error("ファイル名生成エラー: {0}")]
    FilenameGenerationError(String),

    #[error("向きの決定エラー: {0}")]
    OrientationError(String),

    #[error("バックアップエラー: {0}")]
    BackupError(String),

    #[error("重複ファイルエラー: {0}")]
    DuplicateFileError(PathBuf),

    #[error("バースト写真フォルダエラー: {0}")]
    BurstFolderError(String),

    #[error("設定エラー: {0}")]
    ConfigError(String),

    #[error("ログエラー: {0}")]
    LogError(#[from] log::SetLoggerError),
}

pub type Result<T> = std::result::Result<T, PhotoRenamerError>;

// エラーコンテキストを追加するためのトレイト
pub trait ErrorContext {
    fn with_context(self, context: &str) -> Self;
}

impl<T> ErrorContext for std::result::Result<T, PhotoRenamerError> {
    fn with_context(self, context: &str) -> Self {
        self.map_err(|e| match e {
            PhotoRenamerError::FileOperation(io_err) => {
                PhotoRenamerError::FileOperation(std::io::Error::new(
                    io_err.kind(),
                    format!("{}: {}", context, io_err),
                ))
            }
            _ => e,
        })
    }
} 
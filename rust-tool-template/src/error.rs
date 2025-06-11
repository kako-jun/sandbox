/*!
 * エラー処理モジュール
 * 
 * アプリケーション全体で使用されるエラー型を定義する
 */

use thiserror::Error;

/// アプリケーション共通のエラー型
#[derive(Error, Debug)]
pub enum AppError {
    #[error("設定ファイルエラー: {0}")]
    Config(#[from] config::ConfigError),
    
    #[error("IOエラー: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("JSON解析エラー: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("ログ初期化エラー: {0}")]
    LogInit(String),
    
    #[error("TUIエラー: {0}")]
    Tui(String),
    
    #[error("多言語化エラー: {0}")]
    I18n(String),
    
    #[error("一般エラー: {0}")]
    General(String),
}

/// アプリケーション共通のResult型
pub type Result<T> = std::result::Result<T, AppError>;

impl AppError {
    /// エラーメッセージを取得する
    pub fn message(&self) -> String {
        self.to_string()
    }
    
    /// エラーが致命的かどうかを判定する
    pub fn is_fatal(&self) -> bool {
        matches!(self, 
            AppError::Config(_) | 
            AppError::LogInit(_)
        )
    }
}
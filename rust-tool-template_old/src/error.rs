//! Error handling for the application
//! 
//! This module provides a unified error handling system for the application.
//! It uses the `thiserror` crate for error definitions and `anyhow` for error propagation.

use thiserror::Error;

/// アプリケーション全体で使用されるエラー型
#[derive(Error, Debug)]
pub enum AppError {
    /// 設定関連のエラー
    #[error("設定エラー: {0}")]
    Config(String),

    /// ファイル操作関連のエラー
    #[error("ファイルエラー: {0}")]
    File(#[from] std::io::Error),

    /// コマンドライン引数の解析エラー
    #[error("引数解析エラー: {0}")]
    Args(#[from] clap::Error),

    /// プラットフォーム固有のエラー
    #[error("プラットフォームエラー: {0}")]
    Platform(String),

    /// API関連のエラー
    #[error("APIエラー: {0}")]
    Api(String),

    /// 国際化関連のエラー
    #[error("国際化エラー: {0}")]
    I18n(String),

    /// ロギング関連のエラー
    #[error("ロギングエラー: {0}")]
    Logging(String),

    /// データベース関連のエラー
    #[error("データベースエラー: {0}")]
    Database(String),

    /// バリデーションエラー
    #[error("バリデーションエラー: {0}")]
    Validation(String),

    /// 認証エラー
    #[error("認証エラー: {0}")]
    Auth(String),

    /// その他のエラー
    #[error("その他のエラー: {0}")]
    Other(String),

    /// 入力エラー
    #[error("入力エラー: {0}")]
    IoError(String),

    /// シリアライズ/デシリアライズエラー
    #[error("シリアライズ/デシリアライズエラー: {0}")]
    SerdeJson(String),

    /// ログ初期化エラー
    #[error("ログ初期化エラー: {0}")]
    LoggerInit(String),
}

impl AppError {
    /// 新しい設定エラーを作成
    pub fn config(msg: impl Into<String>) -> Self {
        Self::Config(msg.into())
    }

    /// 新しいプラットフォームエラーを作成
    pub fn platform(msg: impl Into<String>) -> Self {
        Self::Platform(msg.into())
    }

    /// 新しいAPIエラーを作成
    pub fn api(msg: impl Into<String>) -> Self {
        Self::Api(msg.into())
    }

    /// 新しい国際化エラーを作成
    pub fn i18n(msg: impl Into<String>) -> Self {
        Self::I18n(msg.into())
    }

    /// 新しいロギングエラーを作成
    pub fn logging(msg: impl Into<String>) -> Self {
        Self::Logging(msg.into())
    }

    /// 新しいデータベースエラーを作成
    pub fn database(msg: impl Into<String>) -> Self {
        Self::Database(msg.into())
    }

    /// 新しいバリデーションエラーを作成
    pub fn validation(msg: impl Into<String>) -> Self {
        Self::Validation(msg.into())
    }

    /// 新しい認証エラーを作成
    pub fn auth(msg: impl Into<String>) -> Self {
        Self::Auth(msg.into())
    }

    /// 新しいその他のエラーを作成
    pub fn other(msg: impl Into<String>) -> Self {
        Self::Other(msg.into())
    }

    /// エラーの重大度を取得
    pub fn severity(&self) -> ErrorSeverity {
        match self {
            Self::Config(_) => ErrorSeverity::Warning,
            Self::File(_) => ErrorSeverity::Error,
            Self::Args(_) => ErrorSeverity::Warning,
            Self::Platform(_) => ErrorSeverity::Error,
            Self::Api(_) => ErrorSeverity::Error,
            Self::I18n(_) => ErrorSeverity::Warning,
            Self::Logging(_) => ErrorSeverity::Error,
            Self::Database(_) => ErrorSeverity::Error,
            Self::Validation(_) => ErrorSeverity::Warning,
            Self::Auth(_) => ErrorSeverity::Error,
            Self::Other(_) => ErrorSeverity::Error,
            Self::IoError(_) => ErrorSeverity::Error,
            Self::SerdeJson(_) => ErrorSeverity::Error,
            Self::LoggerInit(_) => ErrorSeverity::Error,
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::SerdeJson(e.to_string())
    }
}

impl From<log::SetLoggerError> for AppError {
    fn from(e: log::SetLoggerError) -> Self {
        AppError::LoggerInit(e.to_string())
    }
}

/// 設定関連のエラー型
#[derive(Error, Debug)]
pub enum ConfigError {
    /// 設定の読み込みに失敗した場合のエラー
    #[error("Failed to load configuration: {0}")]
    LoadError(String),

    /// 設定が無効な場合のエラー
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    /// 必須の設定が不足している場合のエラー
    #[error("Missing required configuration: {0}")]
    MissingConfig(String),
}

/// API関連のエラー型
#[derive(Error, Debug)]
pub enum ApiError {
    /// APIリクエスト時のエラー
    #[error("Request error: {0}")]
    RequestError(String),

    /// APIレスポンス処理時のエラー
    #[error("Response error: {0}")]
    ResponseError(String),

    /// API認証時のエラー
    #[error("Authentication error: {0}")]
    AuthError(String),
}

/// CLI関連のエラー型
#[derive(Error, Debug)]
pub enum CliError {
    /// 無効な引数が指定された場合のエラー
    #[error("Invalid argument: {0}")]
    InvalidArgument(String),

    /// コマンドが見つからない場合のエラー
    #[error("Command not found: {0}")]
    CommandNotFound(String),

    /// コマンド実行時のエラー
    #[error("Execution error: {0}")]
    ExecutionError(String),
}

/// データベース関連のエラー型
#[derive(Error, Debug)]
pub enum DatabaseError {
    /// データベース接続時のエラー
    #[error("Connection error: {0}")]
    ConnectionError(String),

    /// データベースクエリ実行時のエラー
    #[error("Query error: {0}")]
    QueryError(String),

    /// データベーストランザクション時のエラー
    #[error("Transaction error: {0}")]
    TransactionError(String),
}

/// プラットフォーム固有のエラー型
#[derive(Error, Debug)]
pub enum PlatformError {
    /// サポートされていないプラットフォームの場合のエラー
    #[error("Unsupported platform: {0}")]
    UnsupportedPlatform(String),

    /// プラットフォーム固有の問題が発生した場合のエラー
    #[error("Platform-specific error: {0}")]
    PlatformSpecific(String),
}

/// エラー型のエイリアス
pub type Result<T> = std::result::Result<T, AppError>;

/// エラーの重大度を表す列挙型
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ErrorSeverity {
    /// 警告レベルのエラー
    Warning,
    /// エラーレベルのエラー
    Error,
} 
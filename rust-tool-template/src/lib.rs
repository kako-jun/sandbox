//! Rust Tool Template
//! 
//! 以下の機能を備えたRustアプリケーションの包括的なテンプレート:
//! - サブコマンドをサポートするコマンドラインインターフェース
//! - テキストベースのユーザーインターフェース (TUI)
//! - 国際化 (i18n) サポート
//! - ロギングシステム
//! - プラットフォーム固有の機能
//! - APIサーバー機能
//! - 設定管理
//! - エラーハンドリング
//! 
//! # 使用例
//! 
//! ```no_run
//! use rust_tool_template::cli::run_cli;
//! 
//! fn main() {
//!     if let Err(e) = run_cli() {
//!         eprintln!("エラー: {}", e);
//!         std::process::exit(1);
//!     }
//! }
//! ```

/// API関連の機能
pub mod api;

/// コマンドラインインターフェースの実装
pub mod cli;

/// コアビジネスロジック
pub mod core;

/// 設定管理
pub mod config;

/// エラーハンドリング
pub mod error;

/// 国際化サポート
pub mod i18n;

/// ロギングシステム
pub mod logging;

/// プラットフォーム固有の機能
pub mod platform;

/// ユーティリティ関数とヘルパー
pub mod utils;

pub use core::*;
pub use error::*;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::Config;
    use crate::core::App;
    use crate::error::AppError;
    use crate::i18n::I18n;
    use crate::logging::Logger;
    use crate::platform::Platform;
    use crate::utils::{get_timestamp, to_snake_case, to_camel_case, to_pascal_case};
    use std::path::PathBuf;
    use tempfile::NamedTempFile;

    #[test]
    fn test_config_creation() {
        let config = Config::default();
        assert_eq!(config.log_level, "info");
        assert_eq!(config.log_file, PathBuf::from("app.log"));
    }

    #[test]
    fn test_app_initialization() {
        let config = Config::default();
        let app = App::new(config);
        assert!(app.init().is_ok());
    }

    #[test]
    fn test_i18n_translation() {
        let i18n = I18n::new();
        i18n.set_language("en");
        assert_eq!(i18n.translate("hello"), "hello");
    }

    #[test]
    fn test_platform_detection() {
        assert!(Platform::is_linux() || Platform::is_windows() || Platform::is_macos());
    }

    #[test]
    fn test_logger_initialization() {
        let temp_file = NamedTempFile::new().unwrap();
        let log_file = temp_file.path().to_path_buf();
        assert!(Logger::init(log_file, log::LevelFilter::Info).is_ok());
    }

    #[test]
    fn test_utils_functions() {
        // タイムスタンプのテスト
        let timestamp = get_timestamp();
        assert!(timestamp > 0);

        // ケース変換のテスト
        assert_eq!(to_snake_case("HelloWorld"), "hello_world");
        assert_eq!(to_camel_case("hello_world"), "helloWorld");
        assert_eq!(to_pascal_case("hello_world"), "HelloWorld");
    }

    #[test]
    fn test_error_handling() {
        let error = AppError::config("テストエラー");
        assert!(error.to_string().contains("テストエラー"));
    }

    #[test]
    fn test_api_server() {
        let server = api::ApiServer::new(
            "localhost".to_string(),
            8080,
            "test_key".to_string(),
        );
        assert_eq!(server.port, 8080);
    }
}

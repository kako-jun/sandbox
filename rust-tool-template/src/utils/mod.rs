/*!
 * ユーティリティモジュール
 * 
 * アプリケーション全体で使用される共通機能を提供する
 */

pub mod logging;
pub mod i18n;
pub mod platform;

// よく使用される機能をre-export
pub use logging::{init_logging, cleanup_old_logs};
pub use i18n::{I18n, get_localized_text, init_i18n};
pub use platform::{get_app_dir, get_log_dir, get_config_dir};
/*!
 * Tauriコマンドモジュール
 * 
 * フロントエンドから呼び出されるTauriコマンドを定義する
 */

use crate::core::{AppCore, AppConfig};
use serde::Serialize;
use tauri::State;

/// アプリケーション情報構造体
#[derive(Serialize)]
pub struct AppInfo {
    name: String,
    version: String,
    description: String,
}

/// アプリケーション情報を取得するコマンド
/// 
/// # Arguments
/// * `app_core` - アプリケーションコア
/// 
/// # Returns
/// アプリケーション情報
#[tauri::command]
pub fn get_app_info(_app_core: State<AppCore>) -> AppInfo {
    AppInfo {
        name: env!("CARGO_PKG_NAME").to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        description: env!("CARGO_PKG_DESCRIPTION").to_string(),
    }
}

/// メインコンテンツを取得するコマンド
/// 
/// # Arguments
/// * `app_core` - アプリケーションコア
/// 
/// # Returns
/// メインコンテンツ文字列
#[tauri::command]
pub fn get_main_content(app_core: State<AppCore>) -> String {
    app_core.get_main_content()
}

/// 設定を取得するコマンド
/// 
/// # Arguments
/// * `app_core` - アプリケーションコア
/// 
/// # Returns
/// 現在の設定
#[tauri::command]
pub fn get_config(app_core: State<AppCore>) -> AppConfig {
    app_core.config().clone()
}

/// 言語を設定するコマンド
/// 
/// # Arguments
/// * `language` - 設定する言語コード
/// * `app_core` - アプリケーションコア（mutable）
/// 
/// # Returns
/// 処理結果のメッセージ
#[tauri::command]
pub fn set_language(language: String, _app_core: State<AppCore>) -> Result<String, String> {
    // 注意: Stateは内部的にmutableではないため、実際の実装では
    // Arc<Mutex<AppCore>>を使用するか、別のアプローチが必要
    // ここでは簡単な例として記載
    Ok(format!("Language set to: {}", language))
}

/// ログレベルを設定するコマンド
/// 
/// # Arguments
/// * `log_level` - 設定するログレベル
/// * `app_core` - アプリケーションコア
/// 
/// # Returns
/// 処理結果のメッセージ
#[tauri::command]
pub fn set_log_level(log_level: String, _app_core: State<AppCore>) -> Result<String, String> {
    Ok(format!("Log level set to: {}", log_level))
}

/// CLIモード強制設定を変更するコマンド
/// 
/// # Arguments
/// * `force_cli` - CLIモードを強制するかどうか
/// * `app_core` - アプリケーションコア
/// 
/// # Returns
/// 処理結果のメッセージ
#[tauri::command]
pub fn set_force_cli_mode(force_cli: bool, _app_core: State<AppCore>) -> Result<String, String> {
    Ok(format!("Force CLI mode set to: {}", force_cli))
}
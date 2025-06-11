/*!
 * プラットフォーム固有機能モジュール
 * 
 * OS固有のディレクトリパスや設定を管理する
 */

use crate::error::{AppError, Result};
use directories::ProjectDirs;
use std::path::PathBuf;

/// アプリケーション名
const APP_NAME: &str = "rust-tool-template";
/// 組織名
const ORG_NAME: &str = "kako-jun";

/// アプリケーションのデータディレクトリを取得する
/// 
/// # Returns
/// プラットフォーム固有のアプリケーションデータディレクトリのパス
pub fn get_app_dir() -> Result<PathBuf> {
    let project_dirs = ProjectDirs::from("", ORG_NAME, APP_NAME)
        .ok_or_else(|| AppError::General("ホームディレクトリの取得に失敗".to_string()))?;
    
    Ok(project_dirs.data_dir().to_path_buf())
}

/// ログファイル用ディレクトリを取得する
/// 
/// # Returns
/// ログファイルを保存するディレクトリのパス
pub fn get_log_dir() -> Result<PathBuf> {
    let app_dir = get_app_dir()?;
    Ok(app_dir.join("logs"))
}

/// 設定ファイル用ディレクトリを取得する
/// 
/// # Returns
/// 設定ファイルを保存するディレクトリのパス
pub fn get_config_dir() -> Result<PathBuf> {
    let project_dirs = ProjectDirs::from("", ORG_NAME, APP_NAME)
        .ok_or_else(|| AppError::General("ホームディレクトリの取得に失敗".to_string()))?;
    
    Ok(project_dirs.config_dir().to_path_buf())
}

/// 一時ディレクトリを取得する
/// 
/// # Returns
/// 一時ファイル用ディレクトリのパス
pub fn get_temp_dir() -> PathBuf {
    std::env::temp_dir().join(APP_NAME)
}

/// プラットフォーム情報を取得する
/// 
/// # Returns
/// OS名、アーキテクチャなどの情報を含む文字列
pub fn get_platform_info() -> String {
    format!("{}-{}", 
             std::env::consts::OS, 
             std::env::consts::ARCH)
}
use std::env;

/// プラットフォーム固有の機能を提供する構造体
pub struct Platform;

impl Platform {
    /// 現在のプラットフォームがWindowsかどうかを判定
    pub fn is_windows() -> bool {
        cfg!(target_os = "windows")
    }

    /// 現在のプラットフォームがLinuxかどうかを判定
    pub fn is_linux() -> bool {
        cfg!(target_os = "linux")
    }

    /// 現在のプラットフォームがmacOSかどうかを判定
    pub fn is_macos() -> bool {
        cfg!(target_os = "macos")
    }

    /// 現在のプラットフォームの名前を取得
    pub fn get_platform_name() -> &'static str {
        if Self::is_windows() {
            "Windows"
        } else if Self::is_linux() {
            "Linux"
        } else if Self::is_macos() {
            "macOS"
        } else {
            "Unknown"
        }
    }

    /// 現在のプラットフォームのアーキテクチャを取得
    pub fn get_architecture() -> &'static str {
        if cfg!(target_arch = "x86_64") {
            "x86_64"
        } else if cfg!(target_arch = "aarch64") {
            "aarch64"
        } else {
            "unknown"
        }
    }

    /// 現在のプラットフォームの環境変数を取得
    pub fn get_env_vars() -> Vec<(String, String)> {
        env::vars().collect()
    }

    /// 現在のプラットフォームのホームディレクトリを取得
    pub fn get_home_dir() -> Option<String> {
        env::var("HOME").ok()
    }

    /// 現在のプラットフォームの一時ディレクトリを取得
    pub fn get_temp_dir() -> Option<String> {
        env::var("TEMP").or_else(|_| env::var("TMP")).ok()
    }
} 
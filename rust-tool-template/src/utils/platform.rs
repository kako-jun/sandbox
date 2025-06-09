use std::env;

/// プラットフォーム情報を取得する構造体
#[derive(Debug, Clone)]
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub family: String,
    pub target_triple: String,
    pub is_windows: bool,
    pub is_unix: bool,
    pub is_macos: bool,
    pub is_linux: bool,
}

impl PlatformInfo {
    pub fn new() -> Self {
        Self {
            os: env::consts::OS.to_string(),
            arch: env::consts::ARCH.to_string(),
            family: env::consts::FAMILY.to_string(),
            target_triple: get_target_triple(),
            is_windows: cfg!(target_os = "windows"),
            is_unix: cfg!(target_family = "unix"),
            is_macos: cfg!(target_os = "macos"),
            is_linux: cfg!(target_os = "linux"),
        }
    }

    /// プラットフォーム情報の詳細な文字列表現を取得
    pub fn detailed_info(&self) -> String {
        format!(
            "Platform Information:
  OS: {} ({})
  Architecture: {}
  Family: {}
  Target: {}
  Features: {}",
            self.os,
            if self.is_windows {
                "Windows"
            } else if self.is_macos {
                "macOS"
            } else if self.is_linux {
                "Linux"
            } else {
                "Other Unix"
            },
            self.arch,
            self.family,
            self.target_triple,
            self.get_platform_features()
        )
    }

    /// プラットフォーム固有の機能一覧を取得
    pub fn get_platform_features(&self) -> String {
        let mut features = Vec::new();

        if self.is_windows {
            features.push("Windows Console API");
            features.push("Windows Registry");
            features.push("Windows Services");
        }

        if self.is_unix {
            features.push("Unix Signals");
            features.push("File Permissions");
        }

        if self.is_macos {
            features.push("macOS Frameworks");
            features.push("Cocoa Integration");
        }

        if self.is_linux {
            features.push("XDG Base Directory");
            features.push("systemd Integration");
        }

        // 共通機能
        features.push("Cross-platform TUI");
        features.push("Multi-language Support");
        features.push("Log Rotation");

        features.join(", ")
    }

    /// 推奨されるログディレクトリタイプを取得
    pub fn recommended_log_location(&self) -> &'static str {
        if self.is_windows {
            "%LOCALAPPDATA%\\rust-tool-template\\logs"
        } else if self.is_macos {
            "~/Library/Application Support/rust-tool-template/logs"
        } else if self.is_linux {
            "~/.local/share/rust-tool-template/logs"
        } else {
            "~/.rust-tool-template/logs"
        }
    }

    /// プラットフォーム固有の設定ディレクトリを取得
    pub fn config_location(&self) -> &'static str {
        if self.is_windows {
            "%APPDATA%\\rust-tool-template"
        } else if self.is_macos {
            "~/Library/Preferences/rust-tool-template"
        } else if self.is_linux {
            "~/.config/rust-tool-template"
        } else {
            "~/.rust-tool-template"
        }
    }

    /// 実行ファイルの拡張子を取得
    pub fn executable_extension(&self) -> &'static str {
        if self.is_windows {
            ".exe"
        } else {
            ""
        }
    }

    /// パスセパレータを取得
    pub fn path_separator(&self) -> char {
        if self.is_windows {
            '\\'
        } else {
            '/'
        }
    }
}

impl Default for PlatformInfo {
    fn default() -> Self {
        Self::new()
    }
}

/// ターゲットトリプルを取得（コンパイル時に決定）
fn get_target_triple() -> String {
    // コンパイル時のターゲット情報
    #[cfg(target_os = "windows")]
    #[cfg(target_arch = "x86_64")]
    return "x86_64-pc-windows-msvc".to_string();

    #[cfg(target_os = "windows")]
    #[cfg(target_arch = "x86")]
    return "i686-pc-windows-msvc".to_string();

    #[cfg(target_os = "windows")]
    #[cfg(target_arch = "aarch64")]
    return "aarch64-pc-windows-msvc".to_string();

    #[cfg(target_os = "macos")]
    #[cfg(target_arch = "x86_64")]
    return "x86_64-apple-darwin".to_string();

    #[cfg(target_os = "macos")]
    #[cfg(target_arch = "aarch64")]
    return "aarch64-apple-darwin".to_string();

    #[cfg(target_os = "linux")]
    #[cfg(target_arch = "x86_64")]
    return "x86_64-unknown-linux-gnu".to_string();

    #[cfg(target_os = "linux")]
    #[cfg(target_arch = "aarch64")]
    return "aarch64-unknown-linux-gnu".to_string();

    #[cfg(target_os = "linux")]
    #[cfg(target_arch = "arm")]
    return "arm-unknown-linux-gnueabihf".to_string();

    // その他のプラットフォーム
    format!("{}-unknown-{}", env::consts::ARCH, env::consts::OS)
}

/// プラットフォーム情報を取得する関数
pub fn get_platform_info() -> PlatformInfo {
    PlatformInfo::new()
}

/// 現在のプラットフォームがサポートされているかチェック
pub fn is_supported_platform() -> bool {
    cfg!(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "linux",
        target_family = "unix"
    ))
}

/// プラットフォーム固有の初期化処理
pub fn platform_init() -> anyhow::Result<()> {
    #[cfg(target_os = "windows")]
    {
        // Windows固有の初期化
        // コンソールのUTF-8サポート等
    }

    #[cfg(target_family = "unix")]
    {
        // Unix系固有の初期化
        // シグナルハンドリング等
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_info() {
        let info = PlatformInfo::new();
        assert!(!info.os.is_empty());
        assert!(!info.arch.is_empty());
        assert!(!info.family.is_empty());
        assert!(!info.target_triple.is_empty());
    }

    #[test]
    fn test_platform_features() {
        let info = PlatformInfo::new();
        let features = info.get_platform_features();
        assert!(!features.is_empty());
        assert!(features.contains("Cross-platform TUI"));
    }

    #[test]
    fn test_supported_platform() {
        assert!(is_supported_platform());
    }

    #[test]
    fn test_detailed_info() {
        let info = PlatformInfo::new();
        let detailed = info.detailed_info();
        assert!(detailed.contains("Platform Information:"));
        assert!(detailed.contains(&info.os));
        assert!(detailed.contains(&info.arch));
    }
}

use anyhow::Result;
use dirs::{cache_dir, config_dir, data_local_dir};
use std::fs;
use std::path::PathBuf;
use tracing::info;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

/// ログ設定用の構造体
pub struct LoggingConfig {
    /// ログディレクトリ
    pub log_dir: PathBuf,
    /// 最大ログファイル数
    pub max_files: usize,
    /// ローテーション設定
    pub rotation: Rotation,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        let log_dir = get_default_log_dir();
        Self {
            log_dir,
            max_files: 10,
            rotation: Rotation::DAILY,
        }
    }
}

/// ログを初期化する関数
pub fn setup_logging(config: Option<LoggingConfig>) -> Result<()> {
    let config = config.unwrap_or_default();

    // Create log directory if it doesn't exist
    fs::create_dir_all(&config.log_dir)?;

    // Setup file appender with rotation
    let file_appender = RollingFileAppender::builder()
        .rotation(config.rotation)
        .filename_prefix("rust-tool-template")
        .filename_suffix("log")
        .max_log_files(config.max_files)
        .build(&config.log_dir)?;

    // Setup tracing subscriber with both console and file output
    let file_layer = fmt::layer()
        .with_writer(file_appender)
        .with_ansi(false)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true);

    let console_layer = fmt::layer()
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false);

    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("rust_tool_template=info"));

    tracing_subscriber::registry()
        .with(env_filter)
        .with(file_layer)
        .with(console_layer)
        .init();

    info!("Logging initialized with directory: {:?}", config.log_dir);

    // Clean up old log files
    cleanup_old_logs(&config.log_dir, config.max_files)?;

    Ok(())
}

fn get_default_log_dir() -> PathBuf {
    // Try OS-specific standard directories in order of preference

    // 1. Try data/cache directory (varies by OS)
    if let Some(data_dir) = data_local_dir() {
        return data_dir.join("rust-tool-template").join("logs");
    }

    // 2. Try cache directory as fallback
    if let Some(cache_dir) = cache_dir() {
        return cache_dir.join("rust-tool-template").join("logs");
    }

    // 3. Try config directory as another fallback
    if let Some(config_dir) = config_dir() {
        return config_dir.join("rust-tool-template").join("logs");
    }

    // 4. Legacy home directory approach
    if let Some(home) = dirs::home_dir() {
        return home.join(".rust-tool-template").join("logs");
    }

    // 5. Final fallback to current directory
    PathBuf::from("./logs")
}

fn cleanup_old_logs(log_dir: &PathBuf, max_files: usize) -> Result<()> {
    let mut log_files = Vec::new();

    if let Ok(entries) = fs::read_dir(log_dir) {
        for entry in entries.flatten() {
            if let Some(filename) = entry.file_name().to_str() {
                if filename.starts_with("rust-tool-template") && filename.ends_with(".log") {
                    if let Ok(metadata) = entry.metadata() {
                        log_files.push((
                            entry.path(),
                            metadata
                                .modified()
                                .unwrap_or(std::time::SystemTime::UNIX_EPOCH),
                        ));
                    }
                }
            }
        }
    }

    // Sort by modification time (newest first)
    log_files.sort_by(|a, b| b.1.cmp(&a.1));

    // Remove old files if we exceed max_files
    if log_files.len() > max_files {
        for (path, _) in log_files.iter().skip(max_files) {
            if let Err(e) = fs::remove_file(path) {
                eprintln!("Failed to remove old log file {:?}: {}", path, e);
            } else {
                info!("Removed old log file: {:?}", path);
            }
        }
    }

    Ok(())
}

/// ログディレクトリのパスを取得
pub fn get_log_directory() -> PathBuf {
    get_default_log_dir()
}

/// ログディレクトリの情報を取得
pub fn get_log_directory_info() -> String {
    let log_dir = get_default_log_dir();
    let os_info = get_os_specific_info();

    format!(
        "Log directory: {:?}\nOS-specific location: {}",
        log_dir, os_info
    )
}

fn get_os_specific_info() -> String {
    if let Some(data_dir) = data_local_dir() {
        let path = data_dir.join("rust-tool-template").join("logs");
        return format!(
            "Using data directory: {:?} (OS standard for application data)",
            path
        );
    }

    if let Some(cache_dir) = cache_dir() {
        let path = cache_dir.join("rust-tool-template").join("logs");
        return format!(
            "Using cache directory: {:?} (OS standard for temporary data)",
            path
        );
    }

    if let Some(config_dir) = config_dir() {
        let path = config_dir.join("rust-tool-template").join("logs");
        return format!(
            "Using config directory: {:?} (OS standard for configuration)",
            path
        );
    }

    if let Some(home) = dirs::home_dir() {
        let path = home.join(".rust-tool-template").join("logs");
        return format!("Using home directory: {:?} (legacy fallback)", path);
    }

    "Using current directory: ./logs (final fallback)".to_string()
}

/// ログディレクトリの選択基準を説明
pub fn explain_log_directories() -> String {
    let mut explanation = String::new();

    explanation.push_str("Log directory selection (in order of preference):\n\n");

    #[cfg(target_os = "windows")]
    {
        explanation.push_str("Windows:\n");
        explanation.push_str("  1. %LOCALAPPDATA%\\rust-tool-template\\logs (preferred)\n");
        explanation.push_str("  2. %APPDATA%\\rust-tool-template\\logs (cache fallback)\n");
        explanation.push_str("  3. %APPDATA%\\rust-tool-template\\logs (config fallback)\n");
        explanation.push_str("  4. %USERPROFILE%\\.rust-tool-template\\logs (legacy)\n");
        explanation.push_str("  5. .\\logs (final fallback)\n\n");
    }

    #[cfg(target_os = "macos")]
    {
        explanation.push_str("macOS:\n");
        explanation
            .push_str("  1. ~/Library/Application Support/rust-tool-template/logs (preferred)\n");
        explanation.push_str("  2. ~/Library/Caches/rust-tool-template/logs (cache fallback)\n");
        explanation
            .push_str("  3. ~/Library/Preferences/rust-tool-template/logs (config fallback)\n");
        explanation.push_str("  4. ~/.rust-tool-template/logs (legacy)\n");
        explanation.push_str("  5. ./logs (final fallback)\n\n");
    }

    #[cfg(target_os = "linux")]
    {
        explanation.push_str("Linux:\n");
        explanation
            .push_str("  1. ~/.local/share/rust-tool-template/logs (preferred, XDG_DATA_HOME)\n");
        explanation
            .push_str("  2. ~/.cache/rust-tool-template/logs (cache fallback, XDG_CACHE_HOME)\n");
        explanation.push_str(
            "  3. ~/.config/rust-tool-template/logs (config fallback, XDG_CONFIG_HOME)\n",
        );
        explanation.push_str("  4. ~/.rust-tool-template/logs (legacy)\n");
        explanation.push_str("  5. ./logs (final fallback)\n\n");
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        explanation.push_str("Other Unix-like systems:\n");
        explanation.push_str("  1. System data directory/rust-tool-template/logs (if available)\n");
        explanation.push_str("  2. System cache directory/rust-tool-template/logs (fallback)\n");
        explanation.push_str("  3. System config directory/rust-tool-template/logs (fallback)\n");
        explanation.push_str("  4. ~/.rust-tool-template/logs (legacy)\n");
        explanation.push_str("  5. ./logs (final fallback)\n\n");
    }

    explanation.push_str(
        "The application automatically creates the directory structure if it doesn't exist.\n",
    );
    explanation.push_str("Logs are rotated daily with a maximum of 10 files retained.");

    explanation
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_logging_setup() {
        let temp_dir = TempDir::new().unwrap();
        let config = LoggingConfig {
            log_dir: temp_dir.path().to_path_buf(),
            max_files: 5,
            rotation: Rotation::DAILY,
        };

        assert!(setup_logging(Some(config)).is_ok());
        assert!(temp_dir.path().exists());
    }

    #[test]
    fn test_cleanup_old_logs() {
        let temp_dir = TempDir::new().unwrap();
        let log_dir = temp_dir.path().to_path_buf();

        // Create some test log files
        for i in 0..7 {
            let filename = format!("rust-tool-template.{}.log", i);
            fs::write(log_dir.join(filename), "test content").unwrap();
        }

        cleanup_old_logs(&log_dir, 5).unwrap();

        let remaining_files: Vec<_> = fs::read_dir(&log_dir)
            .unwrap()
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry
                    .file_name()
                    .to_str()
                    .map(|name| name.starts_with("rust-tool-template") && name.ends_with(".log"))
                    .unwrap_or(false)
            })
            .collect();

        assert_eq!(remaining_files.len(), 5);
    }
}

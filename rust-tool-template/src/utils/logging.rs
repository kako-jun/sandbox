/*!
 * ログ機能モジュール
 * 
 * アプリケーションのログ出力を管理する
 * 日付ベースのローテーション機能付き
 */

use crate::error::{AppError, Result};
use chrono::Utc;
use std::path::PathBuf;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

/// ログシステムを初期化する
/// 
/// # Arguments
/// * `log_level` - ログレベル ("debug", "info", "warn", "error")
/// * `log_dir` - ログファイルの保存ディレクトリ
/// 
/// # Returns
/// 初期化が成功した場合はOk(())、失敗した場合はエラー
pub fn init_logging(log_level: &str, log_dir: &PathBuf) -> Result<()> {
    // ログディレクトリを作成
    std::fs::create_dir_all(log_dir)?;
    
    // 日付ベースのローテーションファイルアペンダーを作成
    let file_appender = RollingFileAppender::new(
        Rotation::DAILY,
        log_dir,
        "app.log"
    );
    
    // 環境変数からログレベルを取得、なければ引数のレベルを使用
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(log_level));
    
    // サブスクライバーを設定
    tracing_subscriber::registry()
        .with(
            fmt::layer()
                .with_writer(std::io::stdout)
                .with_ansi(true)
        )
        .with(
            fmt::layer()
                .with_writer(file_appender)
                .with_ansi(false)
                .json()
        )
        .with(env_filter)
        .try_init()
        .map_err(|e| AppError::LogInit(e.to_string()))?;
    
    tracing::info!("ログシステムが初期化されました: {}", log_dir.display());
    Ok(())
}

/// 古いログファイルをクリーンアップする
/// 
/// # Arguments
/// * `log_dir` - ログディレクトリ
/// * `keep_days` - 保持する日数
pub fn cleanup_old_logs(log_dir: &PathBuf, keep_days: u32) -> Result<()> {
    let cutoff_time = Utc::now() - chrono::Duration::days(keep_days as i64);
    
    if let Ok(entries) = std::fs::read_dir(log_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if let Ok(modified) = metadata.modified() {
                    let modified_time = chrono::DateTime::<Utc>::from(modified);
                    if modified_time < cutoff_time {
                        if let Err(e) = std::fs::remove_file(entry.path()) {
                            tracing::warn!("古いログファイルの削除に失敗: {}: {}", 
                                         entry.path().display(), e);
                        } else {
                            tracing::info!("古いログファイルを削除: {}", 
                                         entry.path().display());
                        }
                    }
                }
            }
        }
    }
    
    Ok(())
}
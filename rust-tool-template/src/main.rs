//! Rust Tool Template
//! 
//! A command-line tool template with CLI, TUI, and API server capabilities.
//! This is the main entry point for the application.

use rust_tool_template::api;
use tracing::{info, warn, error};
use rust_tool_template::config::Config;
use rust_tool_template::core::App;
use rust_tool_template::logging::Logger;
use std::path::PathBuf;

/// アプリケーションのエントリーポイント
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // ロガーを初期化
    let log_file = PathBuf::from("app.log");
    Logger::init(log_file, log::LevelFilter::Info)?;

    // 設定を読み込む
    let config = Config::default();

    // アプリケーションを作成
    let app = App::new(config);

    // アプリケーションを初期化
    app.init()?;

    // コマンドラインインターフェースを実行
    if let Err(e) = rust_tool_template::cli::run().await {
        eprintln!("エラー: {}", e);
        std::process::exit(1);
    }

    // アプリケーションを実行
    app.run()?;

    // アプリケーションを終了
    app.shutdown()?;

    Ok(())
}

#[allow(dead_code)]
async fn start_embedded_api_server() -> Option<tokio::task::JoinHandle<()>> {
    // Try to start API server on available port
    let ports = [3030, 3031, 3032, 3033, 3034];

    for &port in &ports {
        match try_start_api_server(port).await {
            Ok(handle) => {
                info!("Embedded API server started on port {}", port);
                return Some(handle);
            }
            Err(e) => {
                warn!("Failed to start API server on port {}: {}", port, e);
            }
        }
    }

    warn!("Could not start embedded API server on any available port");
    None
}

#[allow(dead_code)]
async fn try_start_api_server(
    port: u16,
) -> Result<tokio::task::JoinHandle<()>, Box<dyn std::error::Error + Send + Sync>> {
    // Check if port is available
    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port)).await?;
    drop(listener); // Release the port for the actual server

    // Start the API server in a background task
    let handle = tokio::spawn(async move {
        if let Err(e) = api::start_server(port).await {
            error!("API server error on port {}: {}", port, e);
        }
    });

    // Give the server a moment to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    Ok(handle)
}

//! Rust Tool Template
//! 
//! A command-line tool template with CLI, TUI, and API server capabilities.
//! This is the main entry point for the application.

use rust_tool_template::{api, cli, utils};
use std::process;
use tracing::{info, warn, error};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize enhanced logging with rotation
    if let Err(e) = utils::setup_logging(None) {
        eprintln!("Failed to initialize logging: {}", e);
        process::exit(1);
    }

    info!("Starting rust-tool-template application");

    // Start embedded API server in background
    let api_server_handle = start_embedded_api_server().await;

    // Run the CLI with enhanced error handling
    match cli::run().await {
        Ok(_) => {
            info!("Application finished successfully");
        }
        Err(e) => {
            error!("Application error: {}", e);

            // Log the full error chain for debugging
            let mut source = e.source();
            while let Some(err) = source {
                error!("Caused by: {}", err);
                source = err.source();
            }

            eprintln!("Error: {}", e);
            process::exit(1);
        }
    }

    // Gracefully shutdown API server
    if let Some(handle) = api_server_handle {
        info!("Shutting down embedded API server");
        handle.abort();
    }

    Ok(())
}

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

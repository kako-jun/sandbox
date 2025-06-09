//! API server implementation
//! 
//! This module provides functionality for running an HTTP API server
//! that exposes the application's features via REST endpoints.

pub mod handlers;

use anyhow::Result;
use std::sync::{Arc, Mutex};
use warp::Filter;
use crate::AppLogic;

/// Starts the API server on the specified port
/// 
/// # Arguments
/// 
/// * `port` - The port number to listen on
/// 
/// # Returns
/// 
/// Returns a Result that resolves when the server is shut down
pub async fn start_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let app_logic = Arc::new(Mutex::new(AppLogic::new()));
    let app_logic = warp::any().map(move || app_logic.clone());

    let routes = warp::path("api")
        .and(warp::path("data"))
        .and(warp::get())
        .and(app_logic.clone())
        .and_then(handlers::get_all_data_handler);

    println!("Starting API server on port {}", port);
    warp::serve(routes).run(([127, 0, 0, 1], port)).await;
    Ok(())
}

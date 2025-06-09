//! API server implementation
//! 
//! This module provides functionality for running an HTTP API server
//! that exposes the application's features via REST endpoints.

pub mod handlers;

use anyhow::Result;
use std::net::SocketAddr;
use warp::Filter;

/// APIサーバーの設定と状態を管理する構造体
pub struct ApiServer {
    /// サーバーのホスト名
    pub host: String,
    /// サーバーのポート番号
    pub port: u16,
    /// API認証キー
    pub api_key: String,
}

impl ApiServer {
    /// 新しいApiServerインスタンスを作成
    pub fn new(host: String, port: u16, api_key: String) -> Self {
        Self {
            host,
            port,
            api_key,
        }
    }

    /// APIサーバーを開始
    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        let addr = format!("{}:{}", self.host, self.port).parse::<SocketAddr>()?;
        
        let routes = warp::path("api")
            .and(warp::path("v1"))
            .and(warp::path("health"))
            .and(warp::get())
            .map(|| "OK");

        warp::serve(routes).run(addr).await;
        Ok(())
    }
}

/// APIサーバーを起動する関数
/// 
/// # Arguments
/// 
/// * `port` - The port number to listen on
/// 
/// # Returns
/// 
/// Returns a Result that resolves when the server is shut down
pub async fn start_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let server = ApiServer::new("localhost".to_string(), port, "test_key".to_string());
    server.start().await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_server_creation() {
        let server = ApiServer::new(
            "localhost".to_string(),
            8080,
            "test_key".to_string(),
        );
        assert_eq!(server.port, 8080);
        assert_eq!(server.host, "localhost");
        assert_eq!(server.api_key, "test_key");
    }
}

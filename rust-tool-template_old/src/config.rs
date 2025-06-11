use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// アプリケーションの設定を表す構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    /// ログレベル
    pub log_level: String,
    
    /// ログファイルのパス
    pub log_file: PathBuf,
    
    /// データベースの接続設定
    pub database: DatabaseConfig,
    
    /// APIサーバーの設定
    pub api: ApiConfig,
    
    /// 国際化の設定
    pub i18n: I18nConfig,
}

/// データベースの設定を表す構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConfig {
    /// データベースのURL
    pub url: String,
    
    /// 接続プールの最大サイズ
    pub max_connections: u32,
}

/// APIサーバーの設定を表す構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiConfig {
    /// サーバーのホスト
    pub host: String,
    
    /// サーバーのポート
    pub port: u16,
    
    /// APIキー
    pub api_key: String,
}

/// 国際化の設定を表す構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct I18nConfig {
    /// デフォルトの言語
    pub default_language: String,
    
    /// 翻訳ファイルのディレクトリ
    pub translations_dir: PathBuf,
}

impl Config {
    /// デフォルトの設定を生成
    pub fn default() -> Self {
        Self {
            log_level: "info".to_string(),
            log_file: PathBuf::from("app.log"),
            database: DatabaseConfig {
                url: "postgres://localhost:5432/mydb".to_string(),
                max_connections: 10,
            },
            api: ApiConfig {
                host: "localhost".to_string(),
                port: 8080,
                api_key: "".to_string(),
            },
            i18n: I18nConfig {
                default_language: "en".to_string(),
                translations_dir: PathBuf::from("translations"),
            },
        }
    }

    /// 設定ファイルから設定を読み込む
    pub fn from_file(path: &PathBuf) -> crate::Result<Self> {
        let contents = std::fs::read_to_string(path)?;
        let config = serde_json::from_str(&contents)?;
        Ok(config)
    }

    /// 設定をファイルに保存
    pub fn save_to_file(&self, path: &PathBuf) -> crate::Result<()> {
        let contents = serde_json::to_string_pretty(self)?;
        std::fs::write(path, contents)?;
        Ok(())
    }
} 
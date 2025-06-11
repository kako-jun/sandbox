/*!
 * コア機能モジュール
 * 
 * CUIとGUIで共通して使用されるアプリケーションの核となる機能を提供する
 */

use crate::error::{AppError, Result};
use crate::utils::{init_logging, get_log_dir, get_config_dir, init_i18n};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// アプリケーション設定構造体
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// 言語設定（"en", "ja"など）
    pub language: String,
    /// ログレベル（"debug", "info", "warn", "error"）
    pub log_level: String,
    /// 常にCLIモードで起動するかどうか
    pub force_cli_mode: bool,
    /// ログファイルの保持日数
    pub log_retention_days: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            language: "en".to_string(),
            log_level: "info".to_string(),
            force_cli_mode: false,
            log_retention_days: 7,
        }
    }
}

/// アプリケーションの中核となる構造体
/// CUIとGUIの両方で共有される機能を提供する
pub struct AppCore {
    config: AppConfig,
    config_path: PathBuf,
}

impl AppCore {
    /// 新しいAppCoreインスタンスを作成する
    /// 
    /// # Returns
    /// 初期化されたAppCoreインスタンス、または初期化エラー
    pub fn new() -> Result<Self> {
        tracing::info!("アプリケーションコアを初期化中...");
        
        // 設定ディレクトリを作成
        let config_dir = get_config_dir()?;
        std::fs::create_dir_all(&config_dir)?;
        
        let config_path = config_dir.join("settings.toml");
        
        // 設定を読み込む
        let config = Self::load_config(&config_path)?;
        
        // ログシステムを初期化
        let log_dir = get_log_dir()?;
        init_logging(&config.log_level, &log_dir)?;
        
        // 国際化システムを初期化
        init_i18n(&config.language)?;
        
        tracing::info!("アプリケーションコアの初期化が完了しました");
        
        Ok(Self {
            config,
            config_path,
        })
    }
    
    /// 設定ファイルを読み込む
    /// 
    /// # Arguments
    /// * `config_path` - 設定ファイルのパス
    /// 
    /// # Returns
    /// 読み込まれた設定、またはデフォルト設定
    fn load_config(config_path: &PathBuf) -> Result<AppConfig> {
        if config_path.exists() {
            let content = std::fs::read_to_string(config_path)?;
            let config: AppConfig = toml::from_str(&content)
                .map_err(|e| AppError::General(format!("設定ファイルの解析エラー: {}", e)))?;
            tracing::info!("設定ファイルを読み込みました: {}", config_path.display());
            Ok(config)
        } else {
            let config = AppConfig::default();
            tracing::info!("デフォルト設定を使用します");
            Ok(config)
        }
    }
    
    /// 設定を保存する
    /// 
    /// # Returns
    /// 保存の成功可否
    pub fn save_config(&self) -> Result<()> {
        let content = toml::to_string_pretty(&self.config)
            .map_err(|e| AppError::General(format!("設定のシリアライズエラー: {}", e)))?;
        
        std::fs::write(&self.config_path, content)?;
        tracing::info!("設定ファイルを保存しました: {}", self.config_path.display());
        Ok(())
    }
    
    /// 現在の設定を取得する
    pub fn config(&self) -> &AppConfig {
        &self.config
    }
    
    /// 言語設定を変更する
    /// 
    /// # Arguments
    /// * `language` - 新しい言語コード
    pub fn set_language(&mut self, language: String) -> Result<()> {
        self.config.language = language;
        self.save_config()?;
        tracing::info!("言語設定を変更しました: {}", self.config.language);
        Ok(())
    }
    
    /// ログレベルを変更する
    /// 
    /// # Arguments
    /// * `log_level` - 新しいログレベル
    pub fn set_log_level(&mut self, log_level: String) -> Result<()> {
        self.config.log_level = log_level;
        self.save_config()?;
        tracing::info!("ログレベルを変更しました: {}", self.config.log_level);
        Ok(())
    }
    
    /// CLIモード強制設定を変更する
    /// 
    /// # Arguments
    /// * `force_cli` - CLIモードを強制するかどうか
    pub fn set_force_cli_mode(&mut self, force_cli: bool) -> Result<()> {
        self.config.force_cli_mode = force_cli;
        self.save_config()?;
        tracing::info!("CLIモード強制設定を変更しました: {}", self.config.force_cli_mode);
        Ok(())
    }
    
    /// アプリケーション情報を取得する
    /// 
    /// # Returns
    /// アプリケーション名、バージョン、設定情報を含む文字列
    pub fn get_app_info(&self) -> String {
        format!(
            "App: {} v{}\nLanguage: {}\nLog Level: {}\nCLI Mode: {}",
            env!("CARGO_PKG_NAME"),
            env!("CARGO_PKG_VERSION"),
            self.config.language,
            self.config.log_level,
            self.config.force_cli_mode
        )
    }
    
    /// メインコンテンツを取得する（シンプルな例）
    /// 
    /// # Returns
    /// 表示するメインコンテンツ
    pub fn get_main_content(&self) -> String {
        "hoge".to_string()
    }
}
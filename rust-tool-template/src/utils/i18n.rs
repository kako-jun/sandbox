/*!
 * 国際化（i18n）モジュール
 * 
 * 多言語対応機能を提供する
 */

use crate::error::{AppError, Result};
use fluent::{FluentBundle, FluentResource, FluentArgs};
use fluent_langneg::{negotiate_languages, NegotiationStrategy};
use std::collections::HashMap;
use sys_locale::get_locale;
use unic_langid::LanguageIdentifier;

/// 多言語化管理構造体
pub struct I18n {
    bundles: HashMap<String, FluentBundle<FluentResource>>,
    current_locale: String,
    fallback_locale: String,
}

impl I18n {
    /// 新しいI18nインスタンスを作成する
    /// 
    /// # Arguments
    /// * `fallback_locale` - フォールバック言語（デフォルト："en"）
    /// 
    /// # Returns
    /// 初期化されたI18nインスタンス
    pub fn new(fallback_locale: &str) -> Result<Self> {
        let mut i18n = Self {
            bundles: HashMap::new(),
            current_locale: fallback_locale.to_string(),
            fallback_locale: fallback_locale.to_string(),
        };
        
        // 利用可能な言語を読み込む
        i18n.load_locales()?;
        
        // システムロケールを検出して設定
        i18n.detect_and_set_locale();
        
        Ok(i18n)
    }
    
    /// 利用可能な言語ファイルを読み込む
    fn load_locales(&mut self) -> Result<()> {
        // 英語を読み込む
        if let Ok(content) = std::fs::read_to_string("locales/en/messages.ftl") {
            self.add_locale("en", &content)?;
        }
        
        // 日本語を読み込む
        if let Ok(content) = std::fs::read_to_string("locales/ja/messages.ftl") {
            self.add_locale("ja", &content)?;
        }
        
        Ok(())
    }
    
    /// 言語を追加する
    /// 
    /// # Arguments
    /// * `locale` - 言語コード（例："en", "ja"）
    /// * `content` - Fluentファイルの内容
    fn add_locale(&mut self, locale: &str, content: &str) -> Result<()> {
        let resource = FluentResource::try_new(content.to_string())
            .map_err(|e| AppError::I18n(format!("Fluentリソースの解析エラー: {:?}", e)))?;
        
        let mut bundle = FluentBundle::new(vec![locale.parse::<LanguageIdentifier>()
            .map_err(|e| AppError::I18n(format!("言語コードの解析エラー: {}", e)))?]);
        
        bundle.add_resource(resource)
            .map_err(|e| AppError::I18n(format!("リソースの追加エラー: {:?}", e)))?;
        
        self.bundles.insert(locale.to_string(), bundle);
        tracing::info!("言語を読み込みました: {}", locale);
        
        Ok(())
    }
    
    /// システムロケールを検出して設定する
    fn detect_and_set_locale(&mut self) {
        let system_locale = get_locale().unwrap_or_else(|| "en".to_string());
        let requested_locales: Vec<LanguageIdentifier> = vec![
            system_locale.parse().unwrap_or_else(|_| "en".parse().unwrap())
        ];
        let available_locales: Vec<LanguageIdentifier> = self.bundles
            .keys()
            .filter_map(|s| s.parse().ok())
            .collect();
        
        let fallback: LanguageIdentifier = self.fallback_locale.parse()
            .unwrap_or_else(|_| "en".parse().unwrap());
        
        let negotiated = negotiate_languages(
            &requested_locales,
            &available_locales,
            Some(&fallback),
            NegotiationStrategy::Filtering,
        );
        
        if let Some(locale) = negotiated.first() {
            self.current_locale = locale.to_string();
            tracing::info!("言語を設定しました: {}", self.current_locale);
        }
    }
    
    /// 現在の言語を取得する
    pub fn current_locale(&self) -> &str {
        &self.current_locale
    }
    
    /// 言語を設定する
    /// 
    /// # Arguments
    /// * `locale` - 設定する言語コード
    pub fn set_locale(&mut self, locale: &str) -> Result<()> {
        if self.bundles.contains_key(locale) {
            self.current_locale = locale.to_string();
            tracing::info!("言語を変更しました: {}", locale);
            Ok(())
        } else {
            Err(AppError::I18n(format!("サポートされていない言語: {}", locale)))
        }
    }
    
    /// ローカライズされたテキストを取得する
    /// 
    /// # Arguments
    /// * `key` - メッセージキー
    /// * `args` - メッセージの引数（オプション）
    /// 
    /// # Returns
    /// ローカライズされたテキスト
    pub fn get_text(&self, key: &str, args: Option<&FluentArgs>) -> String {
        // 現在の言語でメッセージを取得を試行
        if let Some(bundle) = self.bundles.get(&self.current_locale) {
            if let Some(message) = bundle.get_message(key) {
                if let Some(pattern) = message.value() {
                    let mut errors = vec![];
                    let formatted = bundle.format_pattern(pattern, args, &mut errors);
                    if errors.is_empty() {
                        return formatted.into_owned();
                    }
                }
            }
        }
        
        // フォールバック言語でメッセージを取得を試行
        if let Some(bundle) = self.bundles.get(&self.fallback_locale) {
            if let Some(message) = bundle.get_message(key) {
                if let Some(pattern) = message.value() {
                    let mut errors = vec![];
                    let formatted = bundle.format_pattern(pattern, args, &mut errors);
                    if errors.is_empty() {
                        return formatted.into_owned();
                    }
                }
            }
        }
        
        // メッセージが見つからない場合はキーをそのまま返す
        tracing::warn!("メッセージが見つかりません: {}", key);
        key.to_string()
    }
}

/// グローバルなI18nインスタンスを保持する静的変数
static mut GLOBAL_I18N: Option<I18n> = None;
static mut I18N_INITIALIZED: bool = false;

/// グローバルI18nを初期化する
/// 
/// # Arguments
/// * `fallback_locale` - フォールバック言語
pub fn init_i18n(fallback_locale: &str) -> Result<()> {
    unsafe {
        if !I18N_INITIALIZED {
            GLOBAL_I18N = Some(I18n::new(fallback_locale)?);
            I18N_INITIALIZED = true;
        }
    }
    Ok(())
}

/// ローカライズされたテキストを取得する（グローバル関数）
/// 
/// # Arguments
/// * `key` - メッセージキー
/// 
/// # Returns
/// ローカライズされたテキスト
pub fn get_localized_text(key: &str) -> String {
    unsafe {
        if let Some(ref i18n) = GLOBAL_I18N {
            i18n.get_text(key, None)
        } else {
            key.to_string()
        }
    }
}
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::RwLock;
use once_cell::sync::Lazy;

/// 翻訳を管理する構造体
pub struct I18n {
    /// 現在の言語
    current_language: RwLock<String>,
    
    /// 翻訳データ
    translations: RwLock<HashMap<String, HashMap<String, String>>>,
}

impl I18n {
    /// 新しいI18nインスタンスを作成
    pub fn new() -> Self {
        Self {
            current_language: RwLock::new("en".to_string()),
            translations: RwLock::new(HashMap::new()),
        }
    }

    /// 翻訳ファイルを読み込む
    pub fn load_translations(&self, language: &str, path: PathBuf) -> crate::Result<()> {
        let contents = std::fs::read_to_string(path)?;
        let translations: HashMap<String, String> = serde_json::from_str(&contents)?;
        
        let mut all_translations = self.translations.write().unwrap();
        all_translations.insert(language.to_string(), translations);
        
        Ok(())
    }

    /// 言語を設定
    pub fn set_language(&self, language: &str) {
        let mut current = self.current_language.write().unwrap();
        *current = language.to_string();
    }

    /// 現在の言語を取得
    pub fn get_current_language(&self) -> String {
        self.current_language.read().unwrap().clone()
    }

    /// テキストを翻訳
    pub fn translate(&self, key: &str) -> String {
        let language = self.current_language.read().unwrap();
        let translations = self.translations.read().unwrap();
        
        translations
            .get(&*language)
            .and_then(|lang_translations| lang_translations.get(key))
            .cloned()
            .unwrap_or_else(|| key.to_string())
    }

    /// キーに基づいて翻訳されたテキストを取得
    pub fn get(&self, key: &str) -> String {
        match key {
            "app-description" => match self.get_current_language().as_str() {
                "ja" => "Rust Tool Template - 包括的なRustアプリケーションテンプレート".to_string(),
                _ => "Rust Tool Template - A comprehensive Rust application template".to_string(),
            },
            "usage-examples" => match self.get_current_language().as_str() {
                "ja" => "使用例:\n  rust-tool-template -m cli -c add -n \"名前\" -v 42\n  rust-tool-template -m cli -c list\n  rust-tool-template -m cli -c stats".to_string(),
                _ => "Usage Examples:\n  rust-tool-template -m cli -c add -n \"name\" -v 42\n  rust-tool-template -m cli -c list\n  rust-tool-template -m cli -c stats".to_string(),
            },
            _ => key.to_string(),
        }
    }
}

/// テキストを翻訳するマクロ
#[macro_export]
macro_rules! t {
    ($key:expr) => {
        crate::i18n::I18N.translate($key)
    };
}

/// グローバルな国際化（i18n）インスタンス
/// 
/// アプリケーション全体で共有される単一のI18nインスタンスを提供します。
/// このインスタンスは遅延初期化され、最初の使用時に作成されます。
pub static I18N: Lazy<I18n> = Lazy::new(I18n::new); 
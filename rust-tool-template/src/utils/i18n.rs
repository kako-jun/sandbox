use fluent::{FluentBundle, FluentResource};
use fluent_bundle::FluentArgs;
use std::collections::HashMap;
use unic_langid::{langid, LanguageIdentifier};

/// 多言語対応（i18n）を管理する構造体
pub struct I18n {
    /// 言語ごとのFluentバンドル
    bundles: HashMap<String, FluentBundle<FluentResource>>,
    /// 現在の言語
    current_lang: String,
}

impl I18n {
    /// 新しいI18nインスタンスを生成
    pub fn new() -> Self {
        let mut i18n = Self {
            bundles: HashMap::new(),
            current_lang: "en".to_string(),
        };

        i18n.load_languages();
        i18n
    }

    fn load_languages(&mut self) {
        // Load English
        if let Ok(source) = std::fs::read_to_string("locales/en/messages.ftl") {
            if let Ok(resource) = FluentResource::try_new(source) {
                let lang_id: LanguageIdentifier = langid!("en");
                let mut bundle = FluentBundle::new(vec![lang_id]);
                bundle.add_resource(resource).unwrap();
                self.bundles.insert("en".to_string(), bundle);
            }
        }

        // Load Japanese
        if let Ok(source) = std::fs::read_to_string("locales/ja/messages.ftl") {
            if let Ok(resource) = FluentResource::try_new(source) {
                let lang_id: LanguageIdentifier = langid!("ja");
                let mut bundle = FluentBundle::new(vec![lang_id]);
                bundle.add_resource(resource).unwrap();
                self.bundles.insert("ja".to_string(), bundle);
            }
        }
    }

    /// 言語をセット
    pub fn set_language(&mut self, lang: &str) {
        if self.bundles.contains_key(lang) {
            self.current_lang = lang.to_string();
        }
    }

    /// キーに対応する翻訳文字列を取得
    pub fn get(&self, key: &str) -> String {
        self.get_with_args(key, None)
    }

    /// 引数付きで翻訳文字列を取得
    pub fn get_with_args(&self, key: &str, args: Option<&FluentArgs<'_>>) -> String {
        if let Some(bundle) = self.bundles.get(&self.current_lang) {
            if let Some(msg) = bundle.get_message(key) {
                if let Some(pattern) = msg.value() {
                    let mut errors = vec![];
                    let formatted = bundle.format_pattern(pattern, args, &mut errors);
                    return formatted.to_string();
                }
            }
        }

        // Fallback to English if current language fails
        if self.current_lang != "en" {
            if let Some(bundle) = self.bundles.get("en") {
                if let Some(msg) = bundle.get_message(key) {
                    if let Some(pattern) = msg.value() {
                        let mut errors = vec![];
                        let formatted = bundle.format_pattern(pattern, args, &mut errors);
                        return formatted.to_string();
                    }
                }
            }
        }

        // Ultimate fallback
        key.to_string()
    }

    /// 現在の言語を取得
    pub fn current_language(&self) -> &str {
        &self.current_lang
    }
}

impl Default for I18n {
    fn default() -> Self {
        Self::new()
    }
}

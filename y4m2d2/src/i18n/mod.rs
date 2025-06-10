use std::collections::HashMap;
use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use chrono_tz::Tz;
use chrono::Local;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Language {
    pub code: String,
    pub name: String,
    pub messages: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct I18n {
    current_language: String,
    languages: HashMap<String, Language>,
    default_timezone: Tz,
}

impl I18n {
    pub fn new() -> Self {
        // システムのタイムゾーンを取得
        let system_timezone = Self::detect_system_timezone();
        
        let mut i18n = I18n {
            current_language: "en".to_string(),
            languages: HashMap::new(),
            default_timezone: system_timezone,
        };
        
        // デフォルトの言語リソースを読み込む
        i18n.load_language("en");
        i18n.load_language("ja");
        
        i18n
    }

    /// システムのタイムゾーンを検出する
    fn detect_system_timezone() -> Tz {
        // システムのローカルタイムゾーンを取得
        let local = Local::now();
        let offset = local.offset().fix().local_minus_utc();
        
        // オフセットからタイムゾーンを推測
        match offset {
            32400 => Tz::Asia__Tokyo,      // UTC+9
            28800 => Tz::Asia__Shanghai,   // UTC+8
            3600 => Tz::Europe__Paris,     // UTC+1
            0 => Tz::UTC,                  // UTC
            -18000 => Tz::America__New_York, // UTC-5
            -28800 => Tz::America__Los_Angeles, // UTC-8
            _ => Tz::UTC,                  // デフォルトはUTC
        }
    }

    pub fn set_language(&mut self, code: &str) {
        if self.languages.contains_key(code) {
            self.current_language = code.to_string();
        }
    }

    pub fn get_message(&self, key: &str) -> String {
        if let Some(lang) = self.languages.get(&self.current_language) {
            if let Some(msg) = lang.messages.get(key) {
                return msg.clone();
            }
        }
        // フォールバック: 英語のメッセージを返す
        if let Some(lang) = self.languages.get("en") {
            if let Some(msg) = lang.messages.get(key) {
                return msg.clone();
            }
        }
        key.to_string()
    }

    pub fn set_timezone(&mut self, timezone: Tz) {
        self.default_timezone = timezone;
    }

    pub fn get_timezone(&self) -> Tz {
        self.default_timezone
    }

    fn load_language(&mut self, code: &str) {
        let path = format!("resources/languages/{}.json", code);
        if let Ok(contents) = fs::read_to_string(path) {
            if let Ok(lang) = serde_json::from_str::<Language>(&contents) {
                self.languages.insert(code.to_string(), lang);
            }
        }
    }
}

// シングルトンとして使用するためのラッパー
lazy_static::lazy_static! {
    static ref I18N: std::sync::Mutex<I18n> = std::sync::Mutex::new(I18n::new());
}

pub fn set_language(code: &str) {
    if let Ok(mut i18n) = I18N.lock() {
        i18n.set_language(code);
    }
}

pub fn get_message(key: &str) -> String {
    if let Ok(i18n) = I18N.lock() {
        i18n.get_message(key)
    } else {
        key.to_string()
    }
}

pub fn set_timezone(timezone: Tz) {
    if let Ok(mut i18n) = I18N.lock() {
        i18n.set_timezone(timezone);
    }
}

pub fn get_timezone() -> Tz {
    if let Ok(i18n) = I18N.lock() {
        i18n.get_timezone()
    } else {
        Tz::UTC
    }
}

pub fn get_system_timezone() -> Tz {
    I18n::detect_system_timezone()
} 
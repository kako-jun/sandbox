/// i18n（多言語対応）モジュール
pub mod i18n;
/// ロギングモジュール
pub mod logging;
/// プラットフォーム情報モジュール
pub mod platform;

use std::time::{SystemTime, UNIX_EPOCH};

/// 現在のUNIXタイムスタンプを取得
pub fn get_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

/// スネークケースに変換
pub fn to_snake_case(s: &str) -> String {
    let mut result = String::new();
    for (i, c) in s.chars().enumerate() {
        if c.is_uppercase() && i > 0 {
            result.push('_');
        }
        result.push(c.to_ascii_lowercase());
    }
    result
}

/// キャメルケースに変換
pub fn to_camel_case(s: &str) -> String {
    let mut result = String::new();
    let mut capitalize = false;
    
    for c in s.chars() {
        if c == '_' {
            capitalize = true;
        } else {
            if capitalize {
                result.push(c.to_ascii_uppercase());
                capitalize = false;
            } else {
                result.push(c.to_ascii_lowercase());
            }
        }
    }
    result
}

/// パスカルケースに変換
pub fn to_pascal_case(s: &str) -> String {
    let mut result = String::new();
    let mut capitalize = true;
    
    for c in s.chars() {
        if c == '_' {
            capitalize = true;
        } else {
            if capitalize {
                result.push(c.to_ascii_uppercase());
                capitalize = false;
            } else {
                result.push(c.to_ascii_lowercase());
            }
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_case_conversion() {
        assert_eq!(to_snake_case("HelloWorld"), "hello_world");
        assert_eq!(to_camel_case("hello_world"), "helloWorld");
        assert_eq!(to_pascal_case("hello_world"), "HelloWorld");
    }

    #[test]
    fn test_timestamp() {
        let timestamp = get_timestamp();
        assert!(timestamp > 0);
    }
}

pub use i18n::*;
pub use logging::*;
pub use platform::*;

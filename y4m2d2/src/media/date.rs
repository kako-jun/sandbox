#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_parse_date_time() {
        let date_info = DateInfo::new();
        
        // 有効な日付文字列のテスト
        let date_str = "2025-02-14 12:34:56";
        let result = date_info.parse_date_time(date_str);
        assert!(result.is_ok());
        let date = result.unwrap();
        assert_eq!(date.year(), 2025);
        assert_eq!(date.month(), 2);
        assert_eq!(date.day(), 14);
        assert_eq!(date.hour(), 12);
        assert_eq!(date.minute(), 34);
        assert_eq!(date.second(), 56);

        // 無効な日付文字列のテスト
        let invalid_date = "invalid date";
        let result = date_info.parse_date_time(invalid_date);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_date_formats() {
        let date_info = DateInfo::new();
        let formats = date_info.get_date_formats();
        assert!(!formats.is_empty());
        
        // 各フォーマットが有効な日付文字列をパースできることを確認
        let test_date = "2025-02-14 12:34:56";
        for format in formats {
            let result = chrono::NaiveDateTime::parse_from_str(test_date, format);
            assert!(result.is_ok());
        }
    }

    #[test]
    fn test_format_date() {
        let date_info = DateInfo::new();
        let date = chrono::NaiveDateTime::parse_from_str(
            "2025-02-14 12:34:56",
            "%Y-%m-%d %H:%M:%S",
        )
        .unwrap();

        let formatted = date_info.format_date(&date);
        assert_eq!(formatted, "2025-02-14_123456");
    }

    #[test]
    fn test_get_directory_path() {
        let date_info = DateInfo::new();
        let date = chrono::NaiveDateTime::parse_from_str(
            "2025-02-14 12:34:56",
            "%Y-%m-%d %H:%M:%S",
        )
        .unwrap();

        let path = date_info.get_directory_path(&date);
        assert_eq!(path, PathBuf::from("2025/02/14"));
    }
} 
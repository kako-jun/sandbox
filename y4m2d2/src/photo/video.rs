use anyhow::{Context, Result};
use chrono::{DateTime, FixedOffset, Local, NaiveDateTime, TimeZone, Utc};
use ffmpeg_next as ffmpeg;
use std::path::Path;
use std::time::SystemTime;

/// 動画ファイルの日付情報を管理する構造体
///
/// 動画ファイルのメタデータから日付情報を抽出し、必要に応じて
/// タイムゾーンの調整を行います。
pub struct VideoDate {
    timezone_offset: i32,
}

impl VideoDate {
    /// 新しい `VideoDate` インスタンスを作成します
    ///
    /// # Returns
    /// 初期化された `VideoDate` インスタンス
    pub fn new() -> Self {
        Self {
            timezone_offset: 9, // デフォルトでJST（UTC+9）
        }
    }

    /// タイムゾーンオフセットを設定します
    ///
    /// # Arguments
    /// * `offset` - タイムゾーンオフセット（時間単位）
    pub fn set_timezone_offset(&mut self, offset: i32) {
        self.timezone_offset = offset;
    }

    /// 動画ファイルの日付を取得します
    ///
    /// # Arguments
    /// * `path` - 動画ファイルのパス
    ///
    /// # Returns
    /// 動画ファイルの日付
    ///
    /// # Errors
    /// 日付の取得に失敗した場合にエラーを返します
    pub fn get_video_date(&self, path: &Path) -> Result<DateTime<Local>> {
        ffmpeg::init()?;
        let input = ffmpeg::format::input(&path)?;
        let date = self.get_date_from_metadata(&input)?;
        Ok(date)
    }

    fn get_date_from_metadata(&self, input: &ffmpeg::format::context::Input) -> Result<DateTime<Local>> {
        let mut date = None;

        // 一般的なメタデータキーをチェック
        let metadata_keys = [
            "creation_time",
            "date",
            "date_created",
            "date_modified",
            "com.apple.quicktime.creationdate",
            "com.apple.quicktime.content.create",
        ];

        for key in &metadata_keys {
            if let Some(value) = input.metadata().get(*key) {
                if let Ok(parsed_date) = self.parse_date_time(value) {
                    date = Some(parsed_date);
                    break;
                }
            }
        }

        // メタデータから日時が取得できない場合は、ファイルの作成日時を使用
        let date = date.unwrap_or_else(|| {
            self.get_file_creation_time(input.url())
                .unwrap_or_else(|_| Local::now())
        });

        Ok(date)
    }

    /// 日付文字列を解析します
    ///
    /// # Arguments
    /// * `date_str` - 解析対象の日付文字列
    ///
    /// # Returns
    /// 解析された日付
    ///
    /// # Errors
    /// 日付の解析に失敗した場合にエラーを返します
    fn parse_date_time(&self, date_str: &str) -> Result<DateTime<Local>> {
        let formats = self.get_date_formats();
        let naive = self.try_parse_with_formats(date_str, &formats)?;
        let utc = Utc.from_utc_datetime(&naive);
        let adjusted = self.adjust_timezone(utc, date_str)?;
        Ok(adjusted.with_timezone(&Local))
    }

    /// サポートされている日付フォーマットのリストを取得します
    ///
    /// # Returns
    /// 日付フォーマットの配列
    fn get_date_formats() -> [&'static str; 5] {
        [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y:%m:%d %H:%M:%S",
            "%Y:%m:%d %H:%M:%S.%f",
        ]
    }

    /// 複数のフォーマットで日付文字列を解析します
    ///
    /// # Arguments
    /// * `date_str` - 解析対象の日付文字列
    /// * `formats` - 試行する日付フォーマットの配列
    ///
    /// # Returns
    /// 解析された日付
    ///
    /// # Errors
    /// すべてのフォーマットで解析に失敗した場合にエラーを返します
    fn try_parse_with_formats(date_str: &str, formats: &[&str]) -> Result<NaiveDateTime> {
        for format in formats {
            if let Ok(naive) = NaiveDateTime::parse_from_str(date_str, format) {
                return Ok(naive);
            }
        }
        Err(anyhow::anyhow!("日付の解析に失敗しました: {}", date_str))
    }

    /// タイムゾーンを調整します
    ///
    /// # Arguments
    /// * `date` - 調整対象の日付
    /// * `date_str` - 元の日付文字列
    ///
    /// # Returns
    /// 調整された日付
    ///
    /// # Errors
    /// タイムゾーンの調整に失敗した場合にエラーを返します
    fn adjust_timezone(&self, date: DateTime<Utc>, date_str: &str) -> Result<DateTime<Utc>> {
        if let Some(modified) = self.get_file_modified_time(date_str)? {
            let time_diff = date.signed_duration_since(modified);
            
            if time_diff.num_hours().abs() > 1 {
                if time_diff.num_hours() > 0 {
                    return Ok(date + chrono::Duration::hours(self.timezone_offset));
                }
            }
        } else {
            return Ok(date + chrono::Duration::hours(self.timezone_offset));
        }

        Ok(date)
    }

    fn get_file_creation_time(&self, path: &str) -> Result<DateTime<Local>> {
        let metadata = std::fs::metadata(path)?;
        let created = metadata.created()?;
        let system_time: SystemTime = created.into();
        let datetime: DateTime<Local> = system_time.into();
        Ok(datetime)
    }

    /// ファイルの更新日時を取得します
    ///
    /// # Arguments
    /// * `date_str` - 日付文字列
    ///
    /// # Returns
    /// ファイルの更新日時
    ///
    /// # Errors
    /// 更新日時の取得に失敗した場合にエラーを返します
    fn get_file_modified_time(&self, date_str: &str) -> Result<Option<DateTime<Utc>>> {
        // このメソッドは実際のファイルシステムから更新日時を取得する必要があります
        // 現在はダミー実装として None を返しています
        Ok(None)
    }
} 
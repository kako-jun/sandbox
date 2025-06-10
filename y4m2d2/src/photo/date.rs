use anyhow::{Context, Result};
use chrono::{DateTime, FixedOffset, Local, NaiveDateTime, TimeZone, Utc};
use kamadak_exif::{In, Tag};
use regex::Regex;
use std::fs::File;
use std::path::Path;

#[derive(Debug, Clone)]
pub enum DateSource {
    Exif,
    Filename,
    CreationTime,
    CurrentTime,
}

pub struct PhotoDate {
    filename_pattern: Regex,
}

impl PhotoDate {
    pub fn new() -> Self {
        Self {
            filename_pattern: Regex::new(r"(\d{4})[-_]?(\d{2})[-_]?(\d{2})[-_]?(\d{2})[-_]?(\d{2})[-_]?(\d{2})")
                .expect("Invalid regex pattern"),
        }
    }

    fn get_date_from_exif(&self, path: &Path) -> Result<(Option<DateTime<Local>>, DateSource)> {
        let file = File::open(path)?;
        let mut bufreader = std::io::BufReader::new(&file);
        let exif = kamadak_exif::Reader::new()
            .read_from_container(&mut bufreader)
            .context("EXIFデータの読み込みに失敗しました")?;

        // オリジナルの日時を取得
        if let Some(field) = exif.get_field(Tag::DateTimeOriginal) {
            if let In::ASCII(ref vec) = field.value {
                if !vec.is_empty() {
                    let date_str = vec[0].trim();
                    if let Ok(naive) = NaiveDateTime::parse_from_str(date_str, "%Y:%m:%d %H:%M:%S") {
                        // EXIFの日時は通常UTCで保存される
                        let utc = Utc.from_utc_datetime(&naive);
                        
                        // タイムゾーン情報を取得
                        let timezone = if let Some(field) = exif.get_field(Tag::TimeZoneOffset) {
                            // EXIFからタイムゾーン情報を取得
                            if let In::SShort(ref vec) = field.value {
                                if !vec.is_empty() {
                                    FixedOffset::east_opt(vec[0] as i32 * 3600).unwrap()
                                } else {
                                    FixedOffset::east_opt(9 * 3600).unwrap() // デフォルトでJST
                                }
                            } else {
                                FixedOffset::east_opt(9 * 3600).unwrap() // デフォルトでJST
                            }
                        } else {
                            // タイムゾーン情報がない場合は、ファイルの更新日時と比較して自動検出
                            if let Ok(metadata) = std::fs::metadata(path) {
                                if let Ok(modified) = metadata.modified() {
                                    let modified: DateTime<Local> = modified.into();
                                    let diff = modified.signed_duration_since(utc);
                                    // 更新日時とEXIFの日時の差が9時間に近い場合はJSTと判断
                                    if (diff.num_seconds() - 9 * 3600).abs() < 3600 {
                                        FixedOffset::east_opt(9 * 3600).unwrap()
                                    } else {
                                        FixedOffset::east_opt(0).unwrap() // UTC
                                    }
                                } else {
                                    FixedOffset::east_opt(9 * 3600).unwrap() // デフォルトでJST
                                }
                            } else {
                                FixedOffset::east_opt(9 * 3600).unwrap() // デフォルトでJST
                            }
                        };

                        let local = utc.with_timezone(&timezone);
                        return Ok((Some(local), DateSource::Exif));
                    }
                }
            }
        }

        Ok((None, DateSource::Exif))
    }

    fn get_date_from_filename(&self, path: &Path) -> Result<(Option<DateTime<Local>>, DateSource)> {
        let filename = path.file_name()
            .and_then(|name| name.to_str())
            .context("ファイル名が無効です")?;

        // 一般的な日付パターンを定義
        let patterns = [
            (r"(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})", "%Y%m%d_%H%M%S"),
            (r"(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})", "%Y-%m-%d_%H-%M-%S"),
            (r"(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})", "%Y%m%d-%H%M%S"),
            (r"IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})", "%Y%m%d_%H%M%S"),
            (r"P(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})", "%Y%m%d_%H%M%S"),
        ];

        for (pattern, format) in patterns {
            if let Ok(re) = Regex::new(pattern) {
                if let Some(caps) = re.captures(filename) {
                    let date_str = caps[0].to_string();
                    if let Ok(naive) = NaiveDateTime::parse_from_str(&date_str, format) {
                        let local = Local.from_local_datetime(&naive).unwrap();
                        return Ok((Some(local), DateSource::Filename));
                    }
                }
            }
        }

        Ok((None, DateSource::Filename))
    }

    fn get_date_from_creation_time(&self, path: &Path) -> Result<(Option<DateTime<Local>>, DateSource)> {
        let metadata = path.metadata()?;
        let created = metadata.created()?;
        let local: DateTime<Local> = created.into();
        Ok((Some(local), DateSource::CreationTime))
    }

    pub fn get_photo_date(&self, path: &Path) -> Result<(Option<DateTime<Local>>, DateSource)> {
        // EXIFから日付を取得
        if let Ok((Some(date), source)) = self.get_date_from_exif(path) {
            return Ok((Some(date), source));
        }

        // ファイル名から日付を取得
        if let Ok((Some(date), source)) = self.get_date_from_filename(path) {
            return Ok((Some(date), source));
        }

        // 作成日時から日付を取得
        if let Ok((Some(date), source)) = self.get_date_from_creation_time(path) {
            return Ok((Some(date), source));
        }

        // どの方法でも取得できない場合は現在時刻を使用
        Ok((Some(Local::now()), DateSource::CurrentTime))
    }
} 
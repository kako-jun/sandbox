use clap::{App, Arg, SubCommand};
use std::path::PathBuf;
use crate::error::{PhotoRenamerError, Result};
use chrono_tz::Tz;
use crate::i18n::get_system_timezone;

/// 画像の向きの処理モードを表す列挙型
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OrientationMode {
    /// EXIF情報に基づいて自動的に向きを修正
    Auto,
    /// 元の向きを維持
    Keep,
    /// ユーザーに確認して向きを決定
    Interactive,
    /// スキップ
    Skip,
}

/// コマンドライン引数を解析するための構造体
///
/// 入力ディレクトリ、出力ディレクトリ、バックアップディレクトリなどの
/// パス情報や、処理モードなどの設定を保持します。
#[derive(Debug)]
pub struct Args {
    /// 入力ディレクトリのパス
    pub input_dir: Option<PathBuf>,

    /// 出力ディレクトリのパス
    pub output_dir: Option<PathBuf>,

    /// バックアップディレクトリのパス
    pub backup_dir: Option<PathBuf>,

    /// 画像の向きの処理モード
    pub orientation_mode: OrientationMode,

    /// アプリケーションが生成したファイルを削除
    pub cleanup: bool,

    /// 並列処理を有効にするかどうか
    pub parallel: bool,

    /// 日付処理のタイムゾーン
    pub timezone: Tz,

    /// 言語
    pub language: String,
}

impl Args {
    /// 新しい `Args` インスタンスを作成します
    ///
    /// # Returns
    /// コマンドライン引数から解析された `Args` インスタンス
    pub fn new() -> Self {
        Self::parse()
    }

    /// 引数の妥当性を検証します
    ///
    /// # Returns
    /// 検証結果。エラーがある場合は `Err` を返します
    pub fn validate(&self) -> Result<(), String> {
        // クリーンアップモードの場合は出力ディレクトリのみ必要
        if self.cleanup {
            if self.output_dir.is_none() {
                return Err("Output directory is required for cleanup mode".to_string());
            }
            return Ok(());
        }

        // 通常モードの場合は入力と出力ディレクトリが必要
        if self.input_dir.is_none() {
            return Err("Input directory is required".to_string());
        }
        if self.output_dir.is_none() {
            return Err("Output directory is required".to_string());
        }

        Ok(())
    }

    pub fn get_effective_threads(&self) -> usize {
        if self.threads == 0 {
            std::thread::available_parallelism()
                .map(|p| p.get())
                .unwrap_or(1)
        } else {
            self.threads
        }
    }

    pub fn get_effective_backup_dir(&self) -> PathBuf {
        self.backup_dir.clone().unwrap_or_else(|| {
            self.output_dir
                .as_ref()
                .map(|dir| dir.parent().unwrap_or_else(|| Path::new(".")).join("backup"))
                .unwrap_or_else(|| Path::new(".").to_path_buf())
        })
    }
}

impl Args {
    pub fn parse() -> Self {
        let matches = App::new("Photo Renamer")
            .version(env!("CARGO_PKG_VERSION"))
            .author(env!("CARGO_PKG_AUTHORS"))
            .about(env!("CARGO_PKG_DESCRIPTION"))
            .after_help("EXAMPLES:\n\
                \n\
                Basic usage:\n\
                photo-renamer -i /path/to/photos -o /path/to/output\n\
                \n\
                With backup:\n\
                photo-renamer -i /path/to/photos -o /path/to/output -b /path/to/backup\n\
                \n\
                Auto orientation:\n\
                photo-renamer -i /path/to/photos -o /path/to/output --orientation auto\n\
                \n\
                Cleanup mode:\n\
                photo-renamer -o /path/to/output --cleanup")
            .arg(
                Arg::with_name("input")
                    .short("i")
                    .long("input")
                    .value_name("DIR")
                    .help("Input directory containing photos and videos")
                    .takes_value(true),
            )
            .arg(
                Arg::with_name("output")
                    .short("o")
                    .long("output")
                    .value_name("DIR")
                    .help("Output directory for renamed files")
                    .takes_value(true),
            )
            .arg(
                Arg::with_name("backup")
                    .short("b")
                    .long("backup")
                    .value_name("DIR")
                    .help("Backup directory for original files")
                    .takes_value(true),
            )
            .arg(
                Arg::with_name("orientation")
                    .long("orientation")
                    .value_name("MODE")
                    .help("Orientation mode (auto/interactive/skip)")
                    .default_value("interactive")
                    .takes_value(true),
            )
            .arg(
                Arg::with_name("cleanup")
                    .long("cleanup")
                    .help("Clean up temporary files"),
            )
            .arg(
                Arg::with_name("parallel")
                    .long("parallel")
                    .help("Enable parallel processing"),
            )
            .arg(
                Arg::with_name("timezone")
                    .long("timezone")
                    .value_name("TZ")
                    .help("Timezone for date processing (default: system timezone)")
                    .takes_value(true),
            )
            .arg(
                Arg::with_name("language")
                    .long("language")
                    .value_name("LANG")
                    .help("Language (en/ja)")
                    .default_value("en")
                    .takes_value(true),
            )
            .get_matches();

        let orientation_mode = match matches.value_of("orientation").unwrap() {
            "auto" => OrientationMode::Auto,
            "interactive" => OrientationMode::Interactive,
            "skip" => OrientationMode::Skip,
            _ => OrientationMode::Interactive,
        };

        // タイムゾーンの設定
        let timezone = if let Some(tz_str) = matches.value_of("timezone") {
            match tz_str.parse::<Tz>() {
                Ok(tz) => tz,
                Err(_) => get_system_timezone(),
            }
        } else {
            get_system_timezone()
        };

        Args {
            input_dir: matches.value_of("input").map(PathBuf::from),
            output_dir: matches.value_of("output").map(PathBuf::from),
            backup_dir: matches.value_of("backup").map(PathBuf::from),
            orientation_mode,
            cleanup: matches.is_present("cleanup"),
            parallel: matches.is_present("parallel"),
            timezone,
            language: matches.value_of("language").unwrap().to_string(),
        }
    }
} 
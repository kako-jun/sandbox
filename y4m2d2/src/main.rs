mod args;
mod core;
mod error;
mod i18n;
mod media;
mod photo;
mod ui;
mod utils;

use anyhow::{Context, Result};
use chrono::{DateTime, Local, NaiveDateTime, Utc};
use clap::Parser;
use kamadak_exif::{In, Tag};
use image::ImageFormat;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use args::Args;
use core::PhotoRenamer;
use log::LevelFilter;
use crate::utils::logger::Logger;
use core::processor::MediaProcessor;
use crate::utils::fs::FileSystem;
use error::Result as CustomResult;
use i18n::{set_language, set_timezone};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// リネームする写真ファイルのパス
    files: Vec<PathBuf>,

    /// 新しいファイル名（拡張子なし）
    #[arg(short, long)]
    name: Option<String>,

    /// ディレクトリのパス
    #[arg(short, long)]
    directory: Option<PathBuf>,

    /// 出力ディレクトリのパス
    #[arg(short, long)]
    output: Option<String>,

    /// プレフィックス
    #[arg(short, long)]
    prefix: Option<String>,

    /// クリーンアップモード
    #[arg(short, long)]
    cleanup: bool,

    /// プレビューモード
    #[arg(short, long)]
    preview: bool,

    /// タイムゾーンオフセット
    #[arg(short, long)]
    timezone: Option<i32>,

    /// 向き情報の確認
    #[arg(short, long)]
    check_orientation: bool,

    /// 向き情報を修正するかどうか
    #[arg(short, long)]
    fix_orientation: bool,

    /// 言語
    #[arg(short, long)]
    language: Option<String>,

    /// 入力ディレクトリ
    #[arg(short, long)]
    input_dir: PathBuf,

    /// バックアップディレクトリ
    #[arg(short, long)]
    backup_dir: PathBuf,

    /// 向きモード
    #[arg(short, long)]
    orientation_mode: core::OrientationMode,

    /// 並列処理
    #[arg(short, long)]
    parallel: bool,
}

fn get_photo_date(path: &Path) -> Result<Option<DateTime<Local>>> {
    let file = std::fs::File::open(path)?;
    let mut bufreader = std::io::BufReader::new(&file);
    let exif = kamadak_exif::Reader::new()
        .read_from_container(&mut bufreader)
        .ok();

    if let Some(exif) = exif {
        if let Some(field) = exif.get_field(Tag::DateTimeOriginal) {
            if let In::ASCII(ref datetime) = field.value {
                if let Ok(naive) = NaiveDateTime::parse_from_str(datetime, "%Y:%m:%d %H:%M:%S") {
                    return Ok(Some(DateTime::from_naive_utc_and_offset(naive, Utc).into()));
                }
            }
        }
    }
    Ok(None)
}

fn rename_photo(path: &Path, new_name: Option<&str>) -> Result<()> {
    let new_name = match new_name {
        Some(name) => name.to_string(),
        None => {
            if let Some(date) = get_photo_date(path)? {
                date.format("%Y%m%d_%H%M%S").to_string()
            } else {
                Local::now().format("%Y%m%d_%H%M%S").to_string()
            }
        }
    };

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .context("ファイルに拡張子がありません")?;

    let new_path = path.with_file_name(format!("{}.{}", new_name, extension));
    let mut counter = 1;
    let mut final_path = new_path.clone();

    while final_path.exists() {
        final_path = path.with_file_name(format!("{}_{}.{}", new_name, counter, extension));
        counter += 1;
    }

    fs::rename(path, &final_path)?;
    println!(
        "リネーム成功: {} → {}",
        path.file_name().unwrap().to_string_lossy(),
        final_path.file_name().unwrap().to_string_lossy()
    );
    Ok(())
}

fn interactive_mode() -> Result<()> {
    println!("写真リネームツール - 対話モード");
    println!("サポートされている形式: .jpg, .jpeg, .png, .gif");

    loop {
        print!("\nリネームする写真のパスを入力してください（終了するには 'q' を入力）: ");
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let path = input.trim();

        if path.to_lowercase() == "q" {
            break;
        }

        let path = Path::new(path);
        if !path.exists() {
            println!("エラー: 指定されたファイルが存在しません。");
            continue;
        }

        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        if !matches!(extension.as_str(), "jpg" | "jpeg" | "png" | "gif") {
            println!("エラー: サポートされていないファイル形式です。");
            continue;
        }

        print!("新しいファイル名を入力してください（デフォルトの場合はEnter）: ");
        io::stdout().flush()?;

        let mut new_name = String::new();
        io::stdin().read_line(&mut new_name)?;
        let new_name = new_name.trim();

        if let Err(e) = rename_photo(path, if new_name.is_empty() { None } else { Some(new_name) }) {
            println!("エラー: {}", e);
        }
    }

    Ok(())
}

fn main() -> CustomResult<()> {
    // コマンドライン引数を解析
    let args = Args::parse();

    // 引数の検証
    if let Err(e) = args.validate() {
        eprintln!("Error: {}", e);
        eprintln!("\nFor more information, try --help");
        std::process::exit(1);
    }

    // 言語とタイムゾーンを設定
    set_language(&args.language);
    set_timezone(args.timezone);

    // メディアプロセッサを作成
    let processor = core::processor::MediaProcessor::new(
        args.input_dir.unwrap(),
        args.output_dir.unwrap(),
        args.backup_dir,
        args.orientation_mode,
        args.cleanup,
        args.parallel,
    );

    // 処理を実行
    processor.process_directory()?;

    Ok(())
}

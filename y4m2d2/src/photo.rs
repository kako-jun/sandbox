use anyhow::{Context, Result};
use chrono::{DateTime, Local, NaiveDateTime, Utc};
use kamadak_exif::{In, Tag};
use regex::Regex;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::time::SystemTime;

pub struct PhotoRenamer;

#[derive(Debug)]
struct RenamePreview {
    original_path: PathBuf,
    new_path: PathBuf,
    date: Option<DateTime<Local>>,
}

impl PhotoRenamer {
    pub fn new() -> Self {
        Self
    }

    fn get_date_from_exif(&self, path: &Path) -> Result<Option<DateTime<Local>>> {
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

    fn get_date_from_filename(&self, path: &Path) -> Option<DateTime<Local>> {
        let filename = path.file_stem()?.to_string_lossy();
        
        // 一般的な日付パターンを試す
        let patterns = [
            // YYYYMMDD_HHMMSS
            (r"(\d{8})_(\d{6})", "%Y%m%d_%H%M%S"),
            // YYYY-MM-DD_HH-MM-SS
            (r"(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})", "%Y-%m-%d_%H-%M-%S"),
            // YYYYMMDD
            (r"(\d{8})", "%Y%m%d"),
            // YYYY-MM-DD
            (r"(\d{4}-\d{2}-\d{2})", "%Y-%m-%d"),
        ];

        for (pattern, format) in patterns.iter() {
            if let Ok(re) = Regex::new(pattern) {
                if let Some(captures) = re.captures(&filename) {
                    if let Some(date_str) = captures.get(1) {
                        if let Ok(naive) = NaiveDateTime::parse_from_str(
                            &format!("{} 00:00:00", date_str.as_str()),
                            &format!("{} %H:%M:%S", format),
                        ) {
                            return Some(DateTime::from_naive_utc_and_offset(naive, Utc).into());
                        }
                    }
                }
            }
        }
        None
    }

    fn get_date_from_creation_time(&self, path: &Path) -> Result<Option<DateTime<Local>>> {
        let metadata = fs::metadata(path)?;
        if let Ok(created) = metadata.created() {
            let system_time: SystemTime = created.into();
            let datetime: DateTime<Local> = system_time.into();
            return Ok(Some(datetime));
        }
        Ok(None)
    }

    fn get_photo_date(&self, path: &Path) -> Result<Option<DateTime<Local>>> {
        // 1. EXIF情報から日付を取得
        if let Some(date) = self.get_date_from_exif(path)? {
            return Ok(Some(date));
        }

        // 2. ファイル名から日付を取得
        if let Some(date) = self.get_date_from_filename(path) {
            return Ok(Some(date));
        }

        // 3. ファイルの作成日時を使用
        self.get_date_from_creation_time(path)
    }

    fn create_output_dir(&self, input_dir: &Path, output_dir: Option<&Path>) -> Result<PathBuf> {
        let output_path = match output_dir {
            Some(path) => path.to_path_buf(),
            None => input_dir.join("renamed"),
        };

        if !output_path.exists() {
            fs::create_dir_all(&output_path)?;
        }

        Ok(output_path)
    }

    fn generate_new_path(&self, path: &Path, output_dir: &Path, prefix: Option<&str>, date: Option<DateTime<Local>>) -> Result<PathBuf> {
        let new_name = match prefix {
            Some(prefix) => {
                if let Some(date) = date {
                    format!("{}_{}", prefix, date.format("%Y%m%d_%H%M%S"))
                } else {
                    format!("{}_{}", prefix, Local::now().format("%Y%m%d_%H%M%S"))
                }
            }
            None => {
                if let Some(date) = date {
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

        let new_path = output_dir.join(format!("{}.{}", new_name, extension));
        let mut counter = 1;
        let mut final_path = new_path.clone();

        while final_path.exists() {
            final_path = output_dir.join(format!("{}_{}.{}", new_name, counter, extension));
            counter += 1;
        }

        Ok(final_path)
    }

    fn preview_photo(&self, path: &Path, output_dir: &Path, prefix: Option<&str>) -> Result<RenamePreview> {
        let date = self.get_photo_date(path)?;
        let new_path = self.generate_new_path(path, output_dir, prefix, date)?;
        
        Ok(RenamePreview {
            original_path: path.to_path_buf(),
            new_path,
            date,
        })
    }

    fn process_photo(&self, path: &Path, output_dir: &Path, prefix: Option<&str>) -> Result<()> {
        let preview = self.preview_photo(path, output_dir, prefix)?;
        fs::copy(path, &preview.new_path)?;
        println!(
            "リネーム成功: {} → {}",
            preview.original_path.file_name().unwrap().to_string_lossy(),
            preview.new_path.file_name().unwrap().to_string_lossy()
        );
        Ok(())
    }

    pub fn cleanup_output_dir(&self, output_dir: &Path) -> Result<()> {
        if output_dir.exists() {
            fs::remove_dir_all(output_dir)?;
            println!("出力ディレクトリを削除しました: {}", output_dir.display());
        }
        Ok(())
    }

    pub fn process_directory(&self, input_dir: &Path, output_dir: Option<&Path>, prefix: Option<&str>, preview: bool) -> Result<()> {
        let output_path = self.create_output_dir(input_dir, output_dir)?;
        let mut previews = Vec::new();
        
        for entry in fs::read_dir(input_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() {
                let extension = path
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .unwrap_or("")
                    .to_lowercase();

                if matches!(extension.as_str(), "jpg" | "jpeg" | "png" | "gif") {
                    match self.preview_photo(&path, &output_path, prefix) {
                        Ok(preview) => previews.push(preview),
                        Err(e) => println!("エラー: {} - {}", path.display(), e),
                    }
                }
            }
        }

        if preview {
            println!("\nプレビュー:");
            for preview in &previews {
                println!(
                    "{} → {}",
                    preview.original_path.file_name().unwrap().to_string_lossy(),
                    preview.new_path.file_name().unwrap().to_string_lossy()
                );
            }
            println!("\n合計 {} ファイル", previews.len());
            return Ok(());
        }

        for preview in previews {
            if let Err(e) = fs::copy(&preview.original_path, &preview.new_path) {
                println!("エラー: {} - {}", preview.original_path.display(), e);
            } else {
                println!(
                    "リネーム成功: {} → {}",
                    preview.original_path.file_name().unwrap().to_string_lossy(),
                    preview.new_path.file_name().unwrap().to_string_lossy()
                );
            }
        }

        Ok(())
    }

    pub fn interactive_mode(&self) -> Result<()> {
        println!("写真リネームツール - 対話モード");
        println!("サポートされている形式: .jpg, .jpeg, .png, .gif");

        loop {
            print!("\n処理する写真が含まれるディレクトリのパスを入力してください（終了するには 'q' を入力）: ");
            io::stdout().flush()?;

            let mut input = String::new();
            io::stdin().read_line(&mut input)?;
            let dir_path = input.trim();

            if dir_path.to_lowercase() == "q" {
                break;
            }

            let dir_path = Path::new(dir_path);
            if !dir_path.exists() || !dir_path.is_dir() {
                println!("エラー: 指定されたディレクトリが存在しません。");
                continue;
            }

            print!("出力先ディレクトリのパスを入力してください（デフォルトの場合はEnter）: ");
            io::stdout().flush()?;

            let mut output_path = String::new();
            io::stdin().read_line(&mut output_path)?;
            let output_path = output_path.trim();

            print!("ファイル名のプレフィックスを入力してください（デフォルトの場合はEnter）: ");
            io::stdout().flush()?;

            let mut prefix = String::new();
            io::stdin().read_line(&mut prefix)?;
            let prefix = prefix.trim();

            let output_dir = if output_path.is_empty() {
                None
            } else {
                Some(Path::new(output_path))
            };

            // プレビュー表示
            if let Err(e) = self.process_directory(
                dir_path,
                output_dir.clone(),
                if prefix.is_empty() { None } else { Some(prefix) },
                true,
            ) {
                println!("エラー: {}", e);
                continue;
            }

            print!("\nこの内容でリネームを実行しますか？ (y/n): ");
            io::stdout().flush()?;

            let mut confirm = String::new();
            io::stdin().read_line(&mut confirm)?;
            if confirm.trim().to_lowercase() != "y" {
                println!("リネームをキャンセルしました。");
                continue;
            }

            if let Err(e) = self.process_directory(
                dir_path,
                output_dir,
                if prefix.is_empty() { None } else { Some(prefix) },
                false,
            ) {
                println!("エラー: {}", e);
            }
        }

        Ok(())
    }
} 
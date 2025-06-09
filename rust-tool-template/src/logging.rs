use log::{LevelFilter, Log, Metadata, Record};
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use chrono::Local;

/// カスタムロガーの実装
pub struct Logger {
    /// ログファイル
    file: Mutex<File>,
    
    /// ログレベル
    level: LevelFilter,
    
    /// ログファイルのパス
    log_path: PathBuf,
    
    /// 最大ログファイルサイズ（バイト）
    max_size: u64,
    
    /// 保持するログファイルの数
    max_files: usize,
}

impl Logger {
    /// 新しいロガーを作成
    pub fn new(log_path: PathBuf, level: LevelFilter) -> crate::Result<Self> {
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)?;
            
        Ok(Self {
            file: Mutex::new(file),
            level,
            log_path,
            max_size: 10 * 1024 * 1024, // 10MB
            max_files: 5,
        })
    }

    /// ロガーを初期化
    pub fn init(log_path: PathBuf, level: LevelFilter) -> crate::Result<()> {
        let logger = Self::new(log_path, level)?;
        log::set_boxed_logger(Box::new(logger))?;
        log::set_max_level(level);
        Ok(())
    }

    /// ログファイルをローテーション
    fn rotate_logs(&self) -> crate::Result<()> {
        let mut file = self.file.lock().unwrap();
        let metadata = file.metadata()?;
        
        if metadata.len() >= self.max_size {
            // 古いログファイルを削除
            for i in (self.max_files - 1..=0).rev() {
                let old_path = if i == 0 {
                    self.log_path.clone()
                } else {
                    self.log_path.with_extension(format!("{}.log", i))
                };
                
                if old_path.exists() {
                    std::fs::remove_file(old_path)?;
                }
            }
            
            // ログファイルをリネーム
            for i in 0..self.max_files - 1 {
                let old_path = if i == 0 {
                    self.log_path.clone()
                } else {
                    self.log_path.with_extension(format!("{}.log", i))
                };
                
                let new_path = self.log_path.with_extension(format!("{}.log", i + 1));
                
                if old_path.exists() {
                    std::fs::rename(old_path, new_path)?;
                }
            }
            
            // 新しいログファイルを作成
            *file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&self.log_path)?;
        }
        
        Ok(())
    }
}

impl Log for Logger {
    fn enabled(&self, metadata: &Metadata<'_>) -> bool {
        metadata.level() <= self.level
    }

    fn log(&self, record: &Record<'_>) {
        if self.enabled(record.metadata()) {
            let mut file = self.file.lock().unwrap();
            let _ = writeln!(
                file,
                "{} [{}] [{}] {}",
                Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                record.level(),
                record.target(),
                record.args()
            );
            
            // ログファイルのローテーションを確認
            if let Err(e) = self.rotate_logs() {
                eprintln!("ログローテーションエラー: {}", e);
            }
        }
    }

    fn flush(&self) {
        let _ = self.file.lock().unwrap().flush();
    }
} 
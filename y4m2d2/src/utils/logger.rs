use chrono::Local;
use log::{Level, LevelFilter, Log, Metadata, Record};
use serde::{Serialize, Deserialize};
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::Path;
use std::sync::Mutex;
use crate::error::{PhotoRenamerError, Result};

#[derive(Debug, Serialize, Deserialize)]
pub struct LogEntry {
    timestamp: String,
    level: String,
    target: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    file: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    line: Option<u32>,
}

pub struct Logger {
    file: Mutex<File>,
    level: LevelFilter,
}

impl Logger {
    pub fn new<P: AsRef<Path>>(log_file: P, level: LevelFilter) -> Result<Self> {
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(log_file)
            .map_err(PhotoRenamerError::FileOperation)?;

        Ok(Self {
            file: Mutex::new(file),
            level,
        })
    }

    pub fn init<P: AsRef<Path>>(log_file: P, level: LevelFilter) -> Result<()> {
        let logger = Self::new(log_file, level)?;
        log::set_boxed_logger(Box::new(logger))
            .map_err(PhotoRenamerError::LogError)?;
        log::set_max_level(level);
        Ok(())
    }
}

impl Log for Logger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= self.level
    }

    fn log(&self, record: &Record) {
        if !self.enabled(record.metadata()) {
            return;
        }

        let entry = LogEntry {
            timestamp: Local::now().to_rfc3339(),
            level: record.level().to_string(),
            target: record.target().to_string(),
            message: record.args().to_string(),
            file: record.file().map(|s| s.to_string()),
            line: record.line(),
        };

        let json = serde_json::to_string(&entry).unwrap_or_else(|_| {
            format!("Failed to serialize log entry: {:?}", entry)
        });

        if let Ok(mut file) = self.file.lock() {
            let _ = writeln!(file, "{}", json);
        }
    }

    fn flush(&self) {
        if let Ok(mut file) = self.file.lock() {
            let _ = file.flush();
        }
    }
}

// ログレベルに応じたマクロ
#[macro_export]
macro_rules! log_error {
    ($($arg:tt)*) => {
        log::error!("{}", format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!("{}", format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_info {
    ($($arg:tt)*) => {
        log::info!("{}", format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_debug {
    ($($arg:tt)*) => {
        log::debug!("{}", format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_trace {
    ($($arg:tt)*) => {
        log::trace!("{}", format!($($arg)*))
    };
} 
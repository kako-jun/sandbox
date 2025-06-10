use anyhow::{Context, Result, anyhow};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use chrono::{DateTime, Local};
use kamadak_exif::{In, Tag};
use image::{self, DynamicImage, ImageFormat};
use std::io::{self, BufReader, Read, Write};
use crate::photo::orientation::{OrientationDetector, OrientationDecision};
use regex::Regex;
use std::fs::{self, File, OpenOptions, Permissions};
use std::io::{self, Read, Write, BufReader, BufWriter};
use std::os::unix::fs::PermissionsExt;
use crate::error::{PhotoRenamerError, Result};

#[derive(Debug, Clone)]
pub struct FileState {
    pub size: u64,
    pub modified: SystemTime,
    pub created: SystemTime,
}

#[derive(Debug, Clone)]
pub struct DirectoryState {
    pub files: HashMap<PathBuf, FileState>,
    pub modified: SystemTime,
}

#[derive(Debug, Clone)]
pub struct BurstPhotoFolder {
    pub folder_path: PathBuf,
    pub photos: Vec<PathBuf>,
    pub timestamp: SystemTime,
}

impl FileState {
    pub fn new(path: &Path) -> Result<Self> {
        let metadata = fs::metadata(path)?;
        Ok(Self {
            size: metadata.len(),
            modified: metadata.modified()?,
            created: metadata.created()?,
        })
    }

    pub fn has_changed(&self, other: &FileState) -> bool {
        self.size != other.size || self.modified != other.modified
    }
}

impl DirectoryState {
    pub fn new(dir: &Path) -> Result<Self> {
        let mut files = HashMap::new();
        let metadata = fs::metadata(dir)?;
        
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                files.insert(path.clone(), FileState::new(&path)?);
            }
        }

        Ok(Self {
            files,
            modified: metadata.modified()?,
        })
    }

    pub fn has_changed(&self, other: &DirectoryState) -> bool {
        if self.modified != other.modified {
            return true;
        }

        if self.files.len() != other.files.len() {
            return true;
        }

        for (path, state) in &self.files {
            if let Some(other_state) = other.files.get(path) {
                if state.has_changed(other_state) {
                    return true;
                }
            } else {
                return true;
            }
        }

        false
    }
}

/// ファイルシステム操作を管理する構造体
///
/// メディアファイルの検索、ファイルの移動、バックアップの作成などの
/// ファイルシステム関連の操作を提供します。
pub struct FileSystem {
    /// ファイル操作時のバッファサイズ（バイト単位）
    buffer_size: usize,
}

impl FileSystem {
    /// 新しい `FileSystem` インスタンスを作成します
    ///
    /// # Returns
    /// デフォルトのバッファサイズ（8KB）で初期化された `FileSystem` インスタンス
    pub fn new() -> Self {
        Self {
            buffer_size: 8192,
        }
    }

    /// バッファサイズを設定します
    ///
    /// # Arguments
    /// * `size` - 新しいバッファサイズ（バイト単位）
    pub fn set_buffer_size(&mut self, size: usize) {
        self.buffer_size = size;
    }

    /// 指定されたディレクトリ内のすべてのメディアファイルを検索します
    ///
    /// # Arguments
    /// * `dir` - 検索対象のディレクトリパス
    ///
    /// # Returns
    /// 見つかったメディアファイルのパスのベクター
    ///
    /// # Errors
    /// ディレクトリの読み込みに失敗した場合にエラーを返します
    pub fn find_all_media_files(&self, dir: &Path) -> Result<Vec<PathBuf>> {
        let mut files = Vec::new();
        self.collect_media_files(dir, &mut files)?;
        Ok(files)
    }

    /// 再帰的にメディアファイルを収集します
    ///
    /// # Arguments
    /// * `dir` - 検索対象のディレクトリパス
    /// * `files` - 見つかったファイルのパスを格納するベクター
    ///
    /// # Errors
    /// ディレクトリの読み込みに失敗した場合にエラーを返します
    fn collect_media_files(&self, dir: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
        for entry in fs::read_dir(dir)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("ディレクトリの読み込みに失敗: {}", dir.display())))? {
            let entry = entry.map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("エントリの読み込みに失敗: {}", dir.display())))?;
            let path = entry.path();

            if path.is_dir() {
                self.collect_media_files(&path, files)?;
            } else if self.is_media_file(&path) {
                files.push(path);
            }
        }
        Ok(())
    }

    /// 指定されたパスがメディアファイルかどうかを判定します
    ///
    /// # Arguments
    /// * `path` - 判定対象のパス
    ///
    /// # Returns
    /// メディアファイルの場合は `true`、そうでない場合は `false`
    pub fn is_media_file(&self, path: &Path) -> bool {
        self.is_image_file(path) || self.is_video_file(path)
    }

    /// 指定されたパスが画像ファイルかどうかを判定します
    ///
    /// # Arguments
    /// * `path` - 判定対象のパス
    ///
    /// # Returns
    /// 画像ファイルの場合は `true`、そうでない場合は `false`
    pub fn is_image_file(&self, path: &Path) -> bool {
        path.extension()
            .and_then(|e| e.to_str())
            .map(|e| matches!(e.to_lowercase().as_str(), "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp"))
            .unwrap_or(false)
    }

    /// 指定されたパスが動画ファイルかどうかを判定します
    ///
    /// # Arguments
    /// * `path` - 判定対象のパス
    ///
    /// # Returns
    /// 動画ファイルの場合は `true`、そうでない場合は `false`
    pub fn is_video_file(&self, path: &Path) -> bool {
        path.extension()
            .and_then(|e| e.to_str())
            .map(|e| matches!(e.to_lowercase().as_str(), "mp4" | "mov" | "avi" | "mkv" | "3gp"))
            .unwrap_or(false)
    }

    /// ファイルを安全にリネームします
    ///
    /// 一時ファイルを使用して安全にリネームを行い、パーミッションを保持します。
    ///
    /// # Arguments
    /// * `src` - 元のファイルパス
    /// * `dst` - 新しいファイルパス
    ///
    /// # Errors
    /// ファイル操作に失敗した場合にエラーを返します
    pub fn rename_file(&self, src: &Path, dst: &Path) -> Result<()> {
        // パーミッションの保存
        let permissions = fs::metadata(src)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("メタデータの読み込みに失敗: {}", src.display())))?
            .permissions();

        // 一時ファイル名の生成
        let temp_dst = dst.with_extension("tmp");

        // ファイルのコピー
        self.copy_file(src, &temp_dst)?;

        // パーミッションの設定
        fs::set_permissions(&temp_dst, permissions.clone())
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("パーミッションの設定に失敗: {}", temp_dst.display())))?;

        // 一時ファイルをリネーム
        fs::rename(&temp_dst, dst)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("ファイルのリネームに失敗: {} -> {}", src.display(), dst.display())))?;

        Ok(())
    }

    /// ファイルを安全にコピーします
    ///
    /// バッファを使用して効率的にファイルをコピーします。
    ///
    /// # Arguments
    /// * `src` - 元のファイルパス
    /// * `dst` - 新しいファイルパス
    ///
    /// # Errors
    /// ファイル操作に失敗した場合にエラーを返します
    fn copy_file(&self, src: &Path, dst: &Path) -> Result<()> {
        let mut reader = BufReader::with_capacity(self.buffer_size, 
            File::open(src).map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("ファイルのオープンに失敗: {}", src.display())))?);
        
        let mut writer = BufWriter::with_capacity(self.buffer_size,
            OpenOptions::new()
                .write(true)
                .create(true)
                .truncate(true)
                .open(dst)
                .map_err(|e| PhotoRenamerError::FileOperation(e)
                    .with_context(&format!("ファイルの作成に失敗: {}", dst.display())))?);

        io::copy(&mut reader, &mut writer)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("ファイルのコピーに失敗: {} -> {}", src.display(), dst.display())))?;

        writer.flush()
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("ファイルのフラッシュに失敗: {}", dst.display())))?;

        Ok(())
    }

    /// ファイルのバックアップを作成します
    ///
    /// # Arguments
    /// * `file` - バックアップ対象のファイルパス
    /// * `backup_dir` - バックアップディレクトリのパス
    ///
    /// # Errors
    /// バックアップの作成に失敗した場合にエラーを返します
    pub fn create_backup(&self, file: &Path, backup_dir: &Path) -> Result<()> {
        // バックアップディレクトリの作成
        fs::create_dir_all(backup_dir)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("バックアップディレクトリの作成に失敗: {}", backup_dir.display())))?;

        // バックアップファイルのパス
        let backup_file = backup_dir.join(file.file_name()
            .ok_or_else(|| PhotoRenamerError::FileOperation(io::Error::new(
                io::ErrorKind::InvalidInput,
                format!("無効なファイル名: {}", file.display())
            )))?);

        // ファイルのコピー
        self.copy_file(file, &backup_file)?;

        // パーミッションの設定
        let permissions = fs::metadata(file)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("メタデータの読み込みに失敗: {}", file.display())))?
            .permissions();

        fs::set_permissions(&backup_file, permissions)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("パーミッションの設定に失敗: {}", backup_file.display())))?;

        Ok(())
    }

    /// アプリケーションが生成したファイルを削除します
    ///
    /// ログファイルや一時ファイルなど、アプリケーションが生成したファイルを
    /// 指定されたディレクトリから再帰的に削除します。
    ///
    /// # Arguments
    /// * `dir` - クリーンアップ対象のディレクトリパス
    ///
    /// # Errors
    /// ファイルの削除に失敗した場合にエラーを返します
    pub fn cleanup_application_files(&self, dir: &Path) -> Result<()> {
        // .logs ディレクトリの削除
        let logs_dir = dir.join(".logs");
        if logs_dir.exists() {
            fs::remove_dir_all(&logs_dir)
                .map_err(|e| PhotoRenamerError::FileOperation(e)
                    .with_context(&format!("ログディレクトリの削除に失敗: {}", logs_dir.display())))?;
        }

        // 一時ファイルの削除
        self.remove_temp_files(dir)?;

        Ok(())
    }

    /// 一時ファイルを再帰的に削除します
    ///
    /// # Arguments
    /// * `dir` - 削除対象のディレクトリパス
    ///
    /// # Errors
    /// ファイルの削除に失敗した場合にエラーを返します
    fn remove_temp_files(&self, dir: &Path) -> Result<()> {
        for entry in fs::read_dir(dir)
            .map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("ディレクトリの読み込みに失敗: {}", dir.display())))? {
            let entry = entry.map_err(|e| PhotoRenamerError::FileOperation(e)
                .with_context(&format!("エントリの読み込みに失敗: {}", dir.display())))?;
            let path = entry.path();

            if path.is_dir() {
                self.remove_temp_files(&path)?;
            } else if self.is_temp_file(&path) {
                fs::remove_file(&path)
                    .map_err(|e| PhotoRenamerError::FileOperation(e)
                        .with_context(&format!("一時ファイルの削除に失敗: {}", path.display())))?;
            }
        }
        Ok(())
    }

    /// 指定されたパスが一時ファイルかどうかを判定します
    ///
    /// # Arguments
    /// * `path` - 判定対象のパス
    ///
    /// # Returns
    /// 一時ファイルの場合は `true`、そうでない場合は `false`
    fn is_temp_file(&self, path: &Path) -> bool {
        // 拡張子が .tmp のファイル
        if let Some(ext) = path.extension() {
            if ext == "tmp" {
                return true;
            }
        }

        // 特定のパターンに一致するファイル名
        if let Some(name) = path.file_name() {
            if let Some(name_str) = name.to_str() {
                return name_str.starts_with("photo_renamer_") && name_str.ends_with(".log");
            }
        }

        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_find_all_media_files() {
        let temp_dir = TempDir::new().unwrap();
        let test_dir = temp_dir.path().join("test");
        fs::create_dir_all(&test_dir).unwrap();

        // テスト用のファイルを作成
        let image_file = test_dir.join("test.jpg");
        let video_file = test_dir.join("test.mp4");
        let text_file = test_dir.join("test.txt");
        fs::write(&image_file, "dummy image data").unwrap();
        fs::write(&video_file, "dummy video data").unwrap();
        fs::write(&text_file, "dummy text data").unwrap();

        let fs = FileSystem::new();
        let files = fs.find_all_media_files(&test_dir).unwrap();
        assert_eq!(files.len(), 2); // 画像と動画ファイルのみ
    }

    #[test]
    fn test_is_media_file() {
        let fs = FileSystem::new();
        assert!(fs.is_media_file("test.jpg"));
        assert!(fs.is_media_file("test.jpeg"));
        assert!(fs.is_media_file("test.png"));
        assert!(fs.is_media_file("test.mp4"));
        assert!(fs.is_media_file("test.mov"));
        assert!(!fs.is_media_file("test.txt"));
        assert!(!fs.is_media_file("test.pdf"));
    }

    #[test]
    fn test_is_image_file() {
        let fs = FileSystem::new();
        assert!(fs.is_image_file("test.jpg"));
        assert!(fs.is_image_file("test.jpeg"));
        assert!(fs.is_image_file("test.png"));
        assert!(!fs.is_image_file("test.mp4"));
        assert!(!fs.is_image_file("test.txt"));
    }

    #[test]
    fn test_is_video_file() {
        let fs = FileSystem::new();
        assert!(fs.is_video_file("test.mp4"));
        assert!(fs.is_video_file("test.mov"));
        assert!(!fs.is_video_file("test.jpg"));
        assert!(!fs.is_video_file("test.txt"));
    }

    #[test]
    fn test_rename_file() {
        let temp_dir = TempDir::new().unwrap();
        let source_file = temp_dir.path().join("source.txt");
        let target_file = temp_dir.path().join("target.txt");
        fs::write(&source_file, "test data").unwrap();

        let fs = FileSystem::new();
        fs.rename_file(&source_file, &target_file).unwrap();
        assert!(!source_file.exists());
        assert!(target_file.exists());
    }

    #[test]
    fn test_copy_file() {
        let temp_dir = TempDir::new().unwrap();
        let source_file = temp_dir.path().join("source.txt");
        let target_file = temp_dir.path().join("target.txt");
        fs::write(&source_file, "test data").unwrap();

        let fs = FileSystem::new();
        fs.copy_file(&source_file, &target_file).unwrap();
        assert!(source_file.exists());
        assert!(target_file.exists());
    }

    #[test]
    fn test_create_backup() {
        let temp_dir = TempDir::new().unwrap();
        let source_file = temp_dir.path().join("test.txt");
        let backup_dir = temp_dir.path().join("backup");
        fs::write(&source_file, "test data").unwrap();

        let fs = FileSystem::new();
        fs.create_backup(&source_file, &backup_dir).unwrap();
        let backup_file = backup_dir.join("test.txt");
        assert!(backup_file.exists());
    }

    #[test]
    fn test_cleanup_application_files() {
        let temp_dir = TempDir::new().unwrap();
        let test_dir = temp_dir.path().join("test");
        fs::create_dir_all(&test_dir).unwrap();

        // アプリケーション生成ファイルを作成
        let log_file = test_dir.join("app.log");
        let temp_file = test_dir.join("temp.tmp");
        fs::write(&log_file, "log data").unwrap();
        fs::write(&temp_file, "temp data").unwrap();

        let fs = FileSystem::new();
        fs.cleanup_application_files(&test_dir).unwrap();
        assert!(!log_file.exists());
        assert!(!temp_file.exists());
    }
} 
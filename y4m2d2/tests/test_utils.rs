use std::fs;
use std::path::Path;
use image::{ImageBuffer, Rgb};
use std::io::Write;

/// テスト用のユーティリティ関数を提供するモジュール
pub struct TestUtils;

impl TestUtils {
    /// テスト用の画像ファイルを生成します
    ///
    /// # Arguments
    /// * `path` - 生成するファイルのパス
    /// * `width` - 画像の幅
    /// * `height` - 画像の高さ
    /// * `exif_data` - 埋め込むEXIFデータ（オプション）
    pub fn create_test_image(path: &Path, width: u32, height: u32, exif_data: Option<&[u8]>) {
        // テスト用の画像を生成
        let img = ImageBuffer::from_fn(width, height, |x, y| {
            Rgb([
                (x as u8).wrapping_mul(y as u8),
                (x as u8).wrapping_add(y as u8),
                (x as u8).wrapping_sub(y as u8),
            ])
        });

        // 画像を保存
        img.save(path).unwrap();

        // EXIFデータがある場合は追加
        if let Some(exif) = exif_data {
            // 注: 実際のEXIFデータの埋め込みは、より複雑な実装が必要
            // ここでは簡易的な実装として、ファイルに追記する
            let mut file = fs::OpenOptions::new()
                .append(true)
                .open(path)
                .unwrap();
            file.write_all(exif).unwrap();
        }
    }

    /// テスト用の動画ファイルを生成します
    ///
    /// # Arguments
    /// * `path` - 生成するファイルのパス
    /// * `duration_secs` - 動画の長さ（秒）
    pub fn create_test_video(path: &Path, duration_secs: u32) {
        // 注: 実際の動画ファイルの生成は、より複雑な実装が必要
        // ここでは簡易的な実装として、ダミーデータを書き込む
        let mut file = fs::File::create(path).unwrap();
        file.write_all(b"dummy video data").unwrap();
    }

    /// テスト用のディレクトリ構造を生成します
    ///
    /// # Arguments
    /// * `root_dir` - ルートディレクトリのパス
    /// * `file_count` - 生成するファイルの数
    pub fn create_test_directory_structure(root_dir: &Path, file_count: u32) {
        // ディレクトリを作成
        fs::create_dir_all(root_dir).unwrap();

        // テストファイルを生成
        for i in 0..file_count {
            let file_path = root_dir.join(format!("test_{}.jpg", i));
            Self::create_test_image(&file_path, 100, 100, None);
        }
    }

    /// テスト用のバックアップディレクトリを生成します
    ///
    /// # Arguments
    /// * `backup_dir` - バックアップディレクトリのパス
    pub fn create_test_backup_directory(backup_dir: &Path) {
        fs::create_dir_all(backup_dir).unwrap();
    }

    /// テスト用の一時ファイルを生成します
    ///
    /// # Arguments
    /// * `temp_dir` - 一時ディレクトリのパス
    pub fn create_test_temp_files(temp_dir: &Path) {
        fs::create_dir_all(temp_dir).unwrap();
        
        // 一時ファイルを生成
        let temp_files = vec!["temp1.tmp", "temp2.tmp", "log1.log", "log2.log"];
        for file_name in temp_files {
            let file_path = temp_dir.join(file_name);
            fs::write(file_path, "dummy temp data").unwrap();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_create_test_image() {
        let temp_dir = TempDir::new().unwrap();
        let image_path = temp_dir.path().join("test.jpg");
        
        TestUtils::create_test_image(&image_path, 100, 100, None);
        assert!(image_path.exists());
    }

    #[test]
    fn test_create_test_video() {
        let temp_dir = TempDir::new().unwrap();
        let video_path = temp_dir.path().join("test.mp4");
        
        TestUtils::create_test_video(&video_path, 10);
        assert!(video_path.exists());
    }

    #[test]
    fn test_create_test_directory_structure() {
        let temp_dir = TempDir::new().unwrap();
        let test_dir = temp_dir.path().join("test");
        
        TestUtils::create_test_directory_structure(&test_dir, 5);
        let files = fs::read_dir(&test_dir).unwrap();
        assert_eq!(files.count(), 5);
    }

    #[test]
    fn test_create_test_temp_files() {
        let temp_dir = TempDir::new().unwrap();
        let temp_files_dir = temp_dir.path().join("temp");
        
        TestUtils::create_test_temp_files(&temp_files_dir);
        let files = fs::read_dir(&temp_files_dir).unwrap();
        assert_eq!(files.count(), 4);
    }
} 
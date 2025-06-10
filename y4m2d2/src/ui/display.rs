use std::io::{self, Write};
use std::time::Instant;
use indicatif::{ProgressBar, ProgressStyle};
use colored::*;

/// ユーザーインターフェースの表示を管理する構造体
///
/// 進捗バーの表示、ファイル情報の表示、ユーザーへのメッセージ表示などの
/// 機能を提供します。
pub struct Display {
    /// 進捗バー
    progress_bar: ProgressBar,
    /// 処理開始時刻
    start_time: Instant,
    current_file: String,
    total_files: usize,
    processed_files: usize,
    fixed_area_height: usize,
}

impl Display {
    /// 新しい `Display` インスタンスを作成します
    ///
    /// # Returns
    /// 初期化された `Display` インスタンス
    pub fn new() -> Self {
        let progress_bar = ProgressBar::new(0);
        progress_bar.set_style(
            ProgressStyle::default_spinner()
                .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} {msg}")
                .unwrap()
                .progress_chars("█▓▒░")
        );

        Self {
            progress_bar,
            start_time: Instant::now(),
            current_file: String::new(),
            total_files: 0,
            processed_files: 0,
            fixed_area_height: 6,
        }
    }

    /// 処理対象のファイル総数を設定します
    ///
    /// # Arguments
    /// * `total` - 処理対象のファイル総数
    pub fn set_total_files(&mut self, total: usize) {
        self.total_files = total;
        self.processed_files = 0;
        self.progress_bar.set_length(total as u64);
        self.clear_screen();
        self.print_header();
        println!("\n");
    }

    /// 進捗状況を更新します
    ///
    /// # Arguments
    /// * `file_path` - 現在処理中のファイルパス
    pub fn update_progress(&mut self, file_path: &str) {
        self.processed_files += 1;
        self.current_file = file_path.to_string();
        self.progress_bar.set_message(&self.current_file);
        self.progress_bar.inc(1);
    }

    /// 処理完了時の表示を行います
    ///
    /// # Arguments
    /// * `total_files` - 処理したファイルの総数
    pub fn finish(&self) {
        let elapsed = self.start_time.elapsed();
        self.progress_bar.finish_with_message(format!(
            "{} 処理完了: {} ファイルを {} で処理しました",
            "✓".green(),
            self.total_files,
            self.format_duration(elapsed)
        ));
    }

    /// 画面をクリアします
    fn clear_screen(&self) {
        print!("\x1B[2J\x1B[1;1H");
        io::stdout().flush().unwrap();
    }

    /// ヘッダーを表示します
    fn print_header(&self) {
        println!("{}", "写真整理ツール - 処理状況".bold().cyan());
        println!("{}", "=".repeat(80).dimmed());
    }

    fn update_display(&self) {
        print!("\x1B[1;1H");
        io::stdout().flush().unwrap();

        self.print_header();
        println!("{}", "=".repeat(80).dimmed());

        print!("\x1B[{};1H", self.fixed_area_height + 2);
        io::stdout().flush().unwrap();
    }

    /// 経過時間をフォーマットします
    ///
    /// # Arguments
    /// * `duration` - フォーマット対象の経過時間
    ///
    /// # Returns
    /// フォーマットされた時間文字列（例: "1分30秒"）
    fn format_duration(&self, duration: std::time::Duration) -> String {
        let secs = duration.as_secs();
        if secs < 60 {
            format!("{}秒", secs)
        } else if secs < 3600 {
            format!("{}分{}秒", secs / 60, secs % 60)
        } else {
            format!("{}時間{}分{}秒", secs / 3600, (secs % 3600) / 60, secs % 60)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;
    use std::sync::{Arc, Mutex};

    // モックの実装
    struct MockUserInput {
        responses: Arc<Mutex<Vec<String>>>,
    }

    impl MockUserInput {
        fn new(responses: Vec<String>) -> Self {
            Self {
                responses: Arc::new(Mutex::new(responses)),
            }
        }

        fn get_response(&self) -> String {
            let mut responses = self.responses.lock().unwrap();
            responses.pop().unwrap_or_default()
        }
    }

    #[test]
    fn test_interactive_confirmation() {
        // テスト用の入力を準備
        let mock_input = MockUserInput::new(vec!["y".to_string(), "n".to_string()]);
        let display = Display::new();

        // 最初の確認（Yes）
        let result = display.confirm("続行しますか？", &mock_input.get_response());
        assert!(result);

        // 2番目の確認（No）
        let result = display.confirm("続行しますか？", &mock_input.get_response());
        assert!(!result);
    }

    #[test]
    fn test_progress_display() {
        let display = Display::new();
        display.set_total_files(10);

        // 進捗の更新をテスト
        for i in 1..=10 {
            display.update_progress(&format!("処理中: {}/10", i));
            // 進捗バーが正しく更新されていることを確認
            assert_eq!(display.current_progress(), i);
        }
    }

    #[test]
    fn test_error_handling() {
        let display = Display::new();
        
        // エラーメッセージの表示をテスト
        display.show_error("テストエラー");
        // エラーメッセージが正しく表示されたことを確認
        // 注: 実際の出力をキャプチャするには、より複雑な設定が必要
    }

    #[test]
    fn test_clear_screen() {
        let display = Display::new();
        display.clear_screen();
        // 画面がクリアされたことを確認
        // 注: 実際の出力をキャプチャするには、より複雑な設定が必要
    }
} 
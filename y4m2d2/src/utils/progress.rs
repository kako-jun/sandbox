use std::io::{self, Write};

pub struct ProgressBar {
    width: usize,
    current: usize,
    total: usize,
}

impl ProgressBar {
    pub fn new(total: usize) -> Self {
        Self {
            width: 50,
            current: 0,
            total,
        }
    }

    pub fn update(&mut self, current: usize) {
        self.current = current;
        self.display();
    }

    pub fn increment(&mut self) {
        self.current += 1;
        self.display();
    }

    fn display(&self) {
        let percentage = (self.current as f64 / self.total as f64 * 100.0) as usize;
        let filled = (self.current as f64 / self.total as f64 * self.width as f64) as usize;
        let empty = self.width - filled;

        print!("\r[{}{}] {}% ({}/{})",
            "=".repeat(filled),
            " ".repeat(empty),
            percentage,
            self.current,
            self.total
        );
        io::stdout().flush().unwrap();
    }

    pub fn finish(&self) {
        println!(); // 改行を追加
    }
}

pub fn display_progress(current: usize, total: usize) {
    let percentage = (current as f64 / total as f64 * 100.0) as usize;
    print!("\r処理中: {}% ({}/{})", percentage, current, total);
    io::stdout().flush().unwrap();
}

pub fn clear_progress() {
    print!("\r{}", " ".repeat(80)); // 80文字分の空白で上書き
    print!("\r"); // カーソルを先頭に戻す
    io::stdout().flush().unwrap();
} 
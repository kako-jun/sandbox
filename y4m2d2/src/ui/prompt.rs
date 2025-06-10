use std::io::{self, Write};
use crate::media::OrientationDecision;

pub struct Prompt {
    display: crate::ui::display::Display,
}

impl Prompt {
    pub fn new(display: crate::ui::display::Display) -> Self {
        Self { display }
    }

    pub fn ask_orientation(&self, image_path: &std::path::Path) -> io::Result<OrientationDecision> {
        println!("\n写真の向きを確認してください。");
        println!("1: そのまま");
        println!("2: 90度回転");
        println!("3: 180度回転");
        println!("4: 270度回転");
        println!("a: 全ての写真に同じ向きを適用");
        print!("選択してください (1-4, a): ");
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;

        Ok(match input.trim() {
            "1" => OrientationDecision::KeepOriginal,
            "2" => OrientationDecision::Rotate90,
            "3" => OrientationDecision::Rotate180,
            "4" => OrientationDecision::Rotate270,
            "a" => {
                println!("\n全ての写真に適用する向きを選択してください。");
                println!("1: そのまま");
                println!("2: 90度回転");
                println!("3: 180度回転");
                println!("4: 270度回転");
                print!("選択してください (1-4): ");
                io::stdout().flush()?;

                let mut input = String::new();
                io::stdin().read_line(&mut input)?;

                match input.trim() {
                    "1" => OrientationDecision::KeepOriginal,
                    "2" => OrientationDecision::Rotate90,
                    "3" => OrientationDecision::Rotate180,
                    "4" => OrientationDecision::Rotate270,
                    _ => OrientationDecision::KeepOriginal,
                }
            }
            _ => OrientationDecision::KeepOriginal,
        })
    }
} 
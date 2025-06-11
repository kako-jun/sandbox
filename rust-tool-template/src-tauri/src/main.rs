// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rust_tool_template::core::AppCore;
use rust_tool_template::tauri::commands::*;

fn main() {
    // アプリケーションコアを初期化
    let app_core = AppCore::new().expect("Failed to initialize app core");
    
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .manage(app_core)
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            set_language,
            get_config
        ])
        .run(context)
        .expect("error while running tauri application");
}
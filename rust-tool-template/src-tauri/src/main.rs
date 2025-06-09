// This file is the entry point for the Tauri application. It initializes the Tauri application and sets up the necessary configurations.

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
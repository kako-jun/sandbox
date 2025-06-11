/*!
 * メインエントリーポイント
 * 
 * CLIオプションに基づいてCLIまたはGUIモードを起動する
 */

use clap::{Arg, ArgAction, Command};
use rust_tool_template::{
    cli::CliApp,
    core::AppCore,
    error::Result,
    utils::{cleanup_old_logs, get_log_dir},
};

#[cfg(feature = "gui")]
use rust_tool_template::tauri::commands::*;

#[cfg(feature = "gui")]
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() -> Result<()> {
    // CLIオプションを解析
    let matches = Command::new(env!("CARGO_PKG_NAME"))
        .version(env!("CARGO_PKG_VERSION"))
        .about(env!("CARGO_PKG_DESCRIPTION"))
        .author("kako-jun")
        .arg(
            Arg::new("cui")
                .long("cui")
                .short('c')
                .help("Force CUI mode instead of GUI")
                .action(ArgAction::SetTrue),
        )
        .arg(
            Arg::new("language")
                .long("lang")
                .short('l')
                .help("Set language (en, ja)")
                .value_name("LANG"),
        )
        .arg(
            Arg::new("log-level")
                .long("log-level")
                .help("Set log level (debug, info, warn, error)")
                .value_name("LEVEL"),
        )
        .arg(
            Arg::new("demo")
                .long("demo")
                .help("Run demo mode (shows functionality without TUI)")
                .action(ArgAction::SetTrue),
        )
        .get_matches();

    // アプリケーションコアを初期化
    let mut app_core = AppCore::new()?;

    // コマンドライン引数から設定を更新
    if let Some(language) = matches.get_one::<String>("language") {
        app_core.set_language(language.clone())?;
    }

    if let Some(log_level) = matches.get_one::<String>("log-level") {
        app_core.set_log_level(log_level.clone())?;
    }

    // 古いログファイルをクリーンアップ
    let log_dir = get_log_dir()?;
    if let Err(e) = cleanup_old_logs(&log_dir, app_core.config().log_retention_days) {
        tracing::warn!("ログクリーンアップエラー: {}", e);
    }

    // デモモードかどうかをチェック
    if matches.get_flag("demo") {
        println!("=== Rust Tool Template Demo ===");
        println!();
        println!("アプリケーション情報:");
        println!("{}", app_core.get_app_info());
        println!();
        println!("メインコンテンツ: {}", app_core.get_main_content());
        println!();
        println!("設定:");
        let config = app_core.config();
        println!("  言語: {}", config.language);
        println!("  ログレベル: {}", config.log_level);
        println!("  CLIモード強制: {}", config.force_cli_mode);
        println!("  ログ保持日数: {}", config.log_retention_days);
        println!();
        println!("✅ アプリケーションは正常に動作しています！");
        println!();
        println!("次のコマンドで実際のインターフェースを試すことができます:");
        println!("  cargo run -- --cui    # CUIインターフェース");
        println!("  cargo run             # GUIインターフェース");
        return Ok(());
    }

    // CUIモードかGUIモードかを決定
    let force_cui = matches.get_flag("cui") || app_core.config().force_cli_mode;

    if force_cui {
        // CUIモードで起動
        tracing::info!("CUIモードで起動します");
        let mut cli_app = CliApp::new(app_core)?;
        cli_app.run()?;
    } else {
        // GUIモード（Tauri）で起動
        tracing::info!("GUIモードで起動します");
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

    tracing::info!("アプリケーションが正常に終了しました");
    Ok(())
}

#[cfg(not(feature = "gui"))]
fn main() -> Result<()> {
    // CLIオプションを解析（CLI専用ビルド）
    let matches = Command::new(env!("CARGO_PKG_NAME"))
        .version(env!("CARGO_PKG_VERSION"))
        .about(env!("CARGO_PKG_DESCRIPTION"))
        .author("kako-jun")
        .arg(
            Arg::new("language")
                .long("lang")
                .short('l')
                .help("Set language (en, ja)")
                .value_name("LANG"),
        )
        .arg(
            Arg::new("log-level")
                .long("log-level")
                .help("Set log level (debug, info, warn, error)")
                .value_name("LEVEL"),
        )
        .arg(
            Arg::new("demo")
                .long("demo")
                .help("Run demo mode (shows functionality without TUI)")
                .action(ArgAction::SetTrue),
        )
        .get_matches();

    // アプリケーションコアを初期化
    let mut app_core = AppCore::new()?;

    // コマンドライン引数から設定を更新
    if let Some(language) = matches.get_one::<String>("language") {
        app_core.set_language(language.clone())?;
    }

    if let Some(log_level) = matches.get_one::<String>("log-level") {
        app_core.set_log_level(log_level.clone())?;
    }

    // 古いログファイルをクリーンアップ
    let log_dir = get_log_dir()?;
    if let Err(e) = cleanup_old_logs(&log_dir, app_core.config().log_retention_days) {
        tracing::warn!("ログクリーンアップエラー: {}", e);
    }

    // デモモードかどうかをチェック
    if matches.get_flag("demo") {
        println!("=== Rust Tool Template Demo ===");
        println!();
        println!("アプリケーション情報:");
        println!("{}", app_core.get_app_info());
        println!();
        println!("メインコンテンツ: {}", app_core.get_main_content());
        println!();
        println!("設定:");
        let config = app_core.config();
        println!("  言語: {}", config.language);
        println!("  ログレベル: {}", config.log_level);
        println!("  CLIモード強制: {}", config.force_cli_mode);
        println!("  ログ保持日数: {}", config.log_retention_days);
        println!();
        println!("✅ アプリケーションは正常に動作しています！");
        return Ok(());
    }

    // CUI専用ビルドではCUIモードで起動
    tracing::info!("CUIモードで起動します");
    let mut cli_app = CliApp::new(app_core)?;
    cli_app.run()?;

    tracing::info!("アプリケーションが正常に終了しました");
    Ok(())
}
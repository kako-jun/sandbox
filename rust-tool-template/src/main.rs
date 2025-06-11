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

fn main() -> Result<()> {
    // CLIオプションを解析
    let matches = Command::new(env!("CARGO_PKG_NAME"))
        .version(env!("CARGO_PKG_VERSION"))
        .about(env!("CARGO_PKG_DESCRIPTION"))
        .author("kako-jun")
        .arg(
            Arg::new("cli")
                .long("cli")
                .short('c')
                .help("Force CLI mode instead of GUI")
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
        println!("  cargo run -- --cli    # TUIインターフェース");
        println!("  cargo tauri dev       # GUIインターフェース");
        return Ok(());
    }

    // CLIモードかGUIモードかを決定
    let force_cli = matches.get_flag("cli") || app_core.config().force_cli_mode;

    if force_cli || !cfg!(feature = "gui") {
        // CLIモードで起動
        tracing::info!("CLIモードで起動します");
        let mut cli_app = CliApp::new(app_core)?;
        cli_app.run()?;
    } else {
        // GUIモード（Tauri）で起動
        #[cfg(feature = "gui")]
        {
            tracing::info!("GUIモードで起動します（Tauriを使用してください）");
            println!("GUI mode: Please use 'cargo tauri dev' or 'cargo tauri build' to run in GUI mode");
            return Ok(());
        }
        
        #[cfg(not(feature = "gui"))]
        {
            tracing::warn!("GUIフィーチャーが無効です。CLIモードで起動します");
            let mut cli_app = CliApp::new(app_core)?;
            cli_app.run()?;
        }
    }

    tracing::info!("アプリケーションが正常に終了しました");
    Ok(())
}
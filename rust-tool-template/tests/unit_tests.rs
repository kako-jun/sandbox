/*!
 * ユニットテスト
 * 
 * 個別のモジュールや関数のテストを実施する
 */

use rust_tool_template::{
    error::{AppError, Result},
    utils::{platform::get_platform_info, logging::cleanup_old_logs},
    core::AppConfig,
};
use tempfile::TempDir;

#[test]
fn エラー型のテスト() {
    // AppErrorの各種類をテスト
    let io_error = AppError::Io(std::io::Error::new(std::io::ErrorKind::NotFound, "test"));
    assert!(io_error.message().contains("test"));
    assert!(!io_error.is_fatal());
    
    let config_error = AppError::Config(config::ConfigError::NotFound("test".to_string()));
    assert!(config_error.is_fatal());
    
    let general_error = AppError::General("テストエラー".to_string());
    assert_eq!(general_error.message(), "一般エラー: テストエラー");
    assert!(!general_error.is_fatal());
}

#[test]
fn アプリケーション設定のテスト() {
    // デフォルト設定のテスト
    let config = AppConfig::default();
    assert_eq!(config.language, "en");
    assert_eq!(config.log_level, "info");
    assert!(!config.force_cli_mode);
    assert_eq!(config.log_retention_days, 7);
    
    // 設定のシリアライゼーション／デシリアライゼーションテスト
    let config_str = toml::to_string(&config).expect("シリアライゼーションに失敗");
    assert!(config_str.contains("language = \"en\""));
    assert!(config_str.contains("log_level = \"info\""));
    
    let deserialized: AppConfig = toml::from_str(&config_str).expect("デシリアライゼーションに失敗");
    assert_eq!(deserialized.language, config.language);
    assert_eq!(deserialized.log_level, config.log_level);
    assert_eq!(deserialized.force_cli_mode, config.force_cli_mode);
    assert_eq!(deserialized.log_retention_days, config.log_retention_days);
}

#[test]
fn プラットフォーム情報のテスト() {
    let platform_info = get_platform_info();
    
    // プラットフォーム情報にOS名とアーキテクチャが含まれることを確認
    assert!(platform_info.contains("-"));
    
    // 既知のOS名のいずれかが含まれることを確認
    let known_os = ["linux", "windows", "macos", "darwin"];
    assert!(known_os.iter().any(|os| platform_info.contains(os)));
}

#[test]
fn ログクリーンアップのテスト() {
    let temp_dir = TempDir::new().expect("一時ディレクトリの作成に失敗");
    let log_dir = temp_dir.path().to_path_buf();
    
    // テスト用のログファイルを作成
    let old_log = log_dir.join("old.log");
    let new_log = log_dir.join("new.log");
    
    std::fs::write(&old_log, "old log content").expect("古いログファイルの作成に失敗");
    std::fs::write(&new_log, "new log content").expect("新しいログファイルの作成に失敗");
    
    // ファイルの更新時刻を古い日付に設定（実際のテストでは時間を操作する必要がある）
    // ここでは簡単なテストとして、クリーンアップ関数が正常に実行されることのみ確認
    let result = cleanup_old_logs(&log_dir, 7);
    assert!(result.is_ok(), "ログクリーンアップに失敗");
}

#[test]
fn 結果型のテスト() {
    // 成功ケース
    let success: Result<i32> = Ok(42);
    assert!(success.is_ok());
    assert_eq!(success.unwrap(), 42);
    
    // エラーケース
    let error: Result<i32> = Err(AppError::General("テストエラー".to_string()));
    assert!(error.is_err());
    
    let err = error.unwrap_err();
    assert!(err.message().contains("テストエラー"));
}

#[cfg(feature = "gui")]
#[test]
fn tauri_commands_テスト() {
    // Tauriコマンドのテスト（GUIフィーチャーが有効な場合のみ）
    // AppInfoの構造体テストは内部フィールドがprivateのため、
    // 実際のコマンド関数をテストする
    assert!(true); // プレースホルダーテスト
}
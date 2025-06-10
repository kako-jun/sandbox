//! Y4M2D2
//!
//! 写真と動画ファイルを整理・リネームするためのRust製ライブラリです。
//! 名前の由来は「Year4Month2Day2」から来ており、日付ベースの整理を重視しています。
//!
//! # 機能
//!
//! - 写真と動画ファイルの自動検出
//! - EXIF情報に基づく日付の取得
//! - 画像の向きの自動検出と修正
//! - 日付ベースのディレクトリ構造の作成
//! - 連続撮影写真のグループ化
//! - バックアップ機能
//! - 並列処理による高速化
//! - インタラクティブな向きの確認
//! - クリーンアップ機能
//!
//! # 使用例
//!
//! ```rust
//! use y4m2d2::core::MediaProcessor;
//! use y4m2d2::args::OrientationMode;
//! use std::path::Path;
//!
//! fn main() -> anyhow::Result<()> {
//!     let mut processor = MediaProcessor::new(OrientationMode::Interactive);
//!     processor.process_directory(
//!         Path::new("/path/to/photos"),
//!         Some(Path::new("/path/to/output"))
//!     )?;
//!     Ok(())
//! }
//! ```
//!
//! # モジュール構造
//!
//! ## args
//! コマンドライン引数の解析を担当します。
//! - `OrientationMode`: 画像の向き処理モードを定義
//! - `Args`: コマンドライン引数を保持する構造体
//!
//! ## core
//! アプリケーションのコア機能を提供します。
//! - `MediaProcessor`: メディアファイルの処理を担当
//! - `FileProcessor`: 個別ファイルの処理を担当
//!
//! ## media
//! メディアファイルの処理に関する機能を提供します。
//! - `DateInfo`: 日付情報の管理
//! - `OrientationDetector`: 画像の向き検出
//! - `VideoDate`: 動画ファイルの日付処理
//!
//! ## photo
//! 写真ファイルの処理に関する機能を提供します。
//! - `PhotoRenamer`: 写真ファイルのリネーム処理
//! - `BurstDetector`: 連続撮影写真の検出
//!
//! ## ui
//! ユーザーインターフェース関連の機能を提供します。
//! - `Display`: 進捗表示とユーザーインタラクション
//! - `ProgressBar`: 進捗バーの管理
//!
//! ## utils
//! ユーティリティ機能を提供します。
//! - `fs`: ファイルシステム操作
//! - `log`: ログ機能
//! - `progress`: 進捗表示のユーティリティ
//!
//! # エラー処理
//!
//! このライブラリは `anyhow::Result` を使用してエラーを処理します。
//! エラーは適切なコンテキスト情報とともに返されます。
//!
//! # ログ機能
//!
//! ログ機能は `log` クレートを使用して実装されています。
//! ログレベルは以下のように設定できます：
//!
//! - `error`: エラー情報
//! - `warn`: 警告情報
//! - `info`: 一般的な情報
//! - `debug`: デバッグ情報
//! - `trace`: 詳細なトレース情報
//!
//! # スレッド安全性
//!
//! このライブラリは並列処理をサポートしており、スレッドセーフに設計されています。
//! 主要なコンポーネントは `Send` と `Sync` を実装しています。
//!
//! # パフォーマンス
//!
//! - 並列処理による高速化
//! - 効率的なメモリ使用
//! - キャッシュ機能による重複処理の回避
//!
//! # 依存関係
//!
//! - `anyhow`: エラー処理
//! - `chrono`: 日付と時刻の処理
//! - `clap`: コマンドライン引数の解析
//! - `exif`: EXIF情報の解析
//! - `image`: 画像処理
//! - `indicatif`: 進捗表示
//! - `log`: ログ機能
//! - `rayon`: 並列処理
//! - `serde`: シリアライズ/デシリアライズ
//!
//! # ライセンス
//!
//! MIT License

pub mod args;
pub mod core;
pub mod media;
pub mod photo;
pub mod ui;
pub mod utils;

/// クレートのバージョン
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// クレートの名前
pub const NAME: &str = env!("CARGO_PKG_NAME");

/// クレートの説明
pub const DESCRIPTION: &str = env!("CARGO_PKG_DESCRIPTION");

/// クレートの作者
pub const AUTHORS: &str = env!("CARGO_PKG_AUTHORS"); 
# Rust ツールテンプレート

[![CI](https://github.com/kako-jun/rust-tool-template/actions/workflows/ci.yml/badge.svg)](https://github.com/kako-jun/rust-tool-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TauriとTUIをサポートするRust CLI/GUIアプリケーション作成用テンプレート。

## 特徴

- **デュアルインターフェース**: CLI（TUIベース）とGUI（Tauriベース）の両方をサポート
- **クロスプラットフォーム**: Linux、Windows、macOSで動作
- **国際化対応**: 英語と日本語をサポート
- **設定管理**: TOML形式での永続的な設定保存
- **ログシステム**: 日次ローテーション付きの構造化ログ
- **エラー処理**: 包括的なエラー管理
- **開発環境完備**: DevContainer、VS Code、CI/CDが設定済み

## はじめに

### 前提条件

- Rust 1.60+
- Node.js 18+ (Tauri GUIモード用)
- GUI開発用システム依存関係 (DevContainerセットアップを参照)

### インストール

1. このリポジトリをクローン:
```bash
git clone https://github.com/kako-jun/rust-tool-template.git
cd rust-tool-template
```

2. プロジェクトをビルド:
```bash
cargo build
```

### 使用方法

#### CLIモード（デフォルト）
```bash
# CLIモードで実行
cargo run -- --cli

# またはCLIモードを強制
cargo run -- --cli --lang ja --log-level debug
```

#### GUIモード（Tauri）
```bash
# 開発モード
cargo tauri dev

# 本番用ビルド
cargo tauri build
```

#### コマンドラインオプション

- `--cli`, `-c`: GUIの代わりにCLIモードを強制
- `--lang <LANG>`, `-l <LANG>`: 言語を設定 (en, ja)
- `--log-level <LEVEL>`: ログレベルを設定 (debug, info, warn, error)

## 開発

### DevContainerセットアップ

このプロジェクトは一貫した開発環境のための完全なDevContainerセットアップを含んでいます：

1. VS Codeで開く
2. "Dev Containers"拡張機能をインストール
3. コマンドパレットを開き「Dev Containers: Reopen in Container」を選択

### VS Code統合

- **F5**: デバッガー付きでCLIモードを起動
- **Ctrl+Shift+P** → "Tasks: Run Task" → "Tauri: dev": GUIモードを起動

### プロジェクト構造

```
src/
├── core/           # 共有アプリケーションロジック
├── cli/            # TUIベースのCLIインターフェース
├── tauri/          # Tauri GUIコマンド
├── utils/          # ユーティリティモジュール（ログ、i18n、プラットフォーム）
├── error.rs        # エラーハンドリング
├── lib.rs          # ライブラリルート
└── main.rs         # アプリケーションエントリーポイント

locales/            # 国際化ファイル
├── en/messages.ftl # 英語メッセージ
└── ja/messages.ftl # 日本語メッセージ

tests/              # テストファイル
├── integration_tests.rs
└── unit_tests.rs

.devcontainer/      # DevContainer設定
.github/workflows/  # CI/CDワークフロー
.vscode/           # VS Code設定
```

### アーキテクチャ

アプリケーションはモジュラーアーキテクチャに従っています：

- **Coreモジュール**: CLIとGUI間で共有されるビジネスロジック
- **CLIモジュール**: ratatuiを使用したTUIベースインターフェース
- **Tauriモジュール**: GUIフロントエンド用コマンド
- **Utilsモジュール**: プラットフォーム固有ユーティリティ、ログ、i18n

### 設定

アプリケーション設定は以下に保存されます：
- **Linux**: `~/.config/rust-tool-template/settings.toml`
- **Windows**: `%APPDATA%/kako-jun/rust-tool-template/config/settings.toml`
- **macOS**: `~/Library/Application Support/com.kako-jun.rust-tool-template/settings.toml`

ログは以下に保存されます：
- **Linux**: `~/.local/share/rust-tool-template/logs/`
- **Windows**: `%APPDATA%/kako-jun/rust-tool-template/data/logs/`
- **macOS**: `~/Library/Application Support/com.kako-jun.rust-tool-template/logs/`

## テスト

全テストを実行：
```bash
cargo test
```

特定のテストを実行：
```bash
cargo test unit_tests
cargo test integration_tests
```

## 国際化

アプリケーションはFluentを使用して複数言語をサポートしています：

- `locales/<lang>/messages.ftl`に新しい言語ファイルを追加
- 新しい言語を読み込むためにi18nモジュールを更新
- 翻訳された文字列を取得するために`get_localized_text()`関数を使用

## 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を加える
4. 新機能にテストを追加
5. `cargo clippy`と`cargo fmt`を実行
6. プルリクエストを送信

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作者

- **kako-jun** - [GitHub](https://github.com/kako-jun)

## 謝辞

- [Tauri](https://tauri.app/) - GUIフレームワーク
- [ratatui](https://github.com/ratatui-org/ratatui) - TUIインターフェース
- [Fluent](https://projectfluent.org/) - 国際化
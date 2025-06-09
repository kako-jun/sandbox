# Rust Tool Template

[![Tests](https://github.com/yourusername/rust-tool-template/actions/workflows/tests.yml/badge.svg)](https://github.com/yourusername/rust-tool-template/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/yourusername/rust-tool-template/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/rust-tool-template)
[![Rust Version](https://img.shields.io/badge/rust-1.70.0+-blue.svg)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Rustアプリケーションの包括的なテンプレートです。以下の機能を備えています：

- サブコマンドをサポートするコマンドラインインターフェース
- テキストベースのユーザーインターフェース (TUI)
- 国際化 (i18n) サポート
- ロギングシステム（ローテーション・コンテナ対応）
- プラットフォーム固有の機能
- APIサーバー機能
- 設定管理
- エラーハンドリング

## 必要条件

- Rust 1.70.0以上
- Cargo
- その他の依存関係（Cargo.tomlを参照）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/rust-tool-template.git
cd rust-tool-template

# ビルド
cargo build --release

# インストール（オプション）
cargo install --path .
```

## 使用方法

### コマンドラインインターフェース

```bash
# ヘルプを表示
rust-tool-template --help

# 設定を表示
rust-tool-template config show

# 設定を変更
rust-tool-template config set <key> <value>

# APIサーバーを起動
rust-tool-template api start

# APIサーバーを停止
rust-tool-template api stop
```

### APIサーバー

APIサーバーは以下のエンドポイントを提供します：

- `GET /api/hello`: ヘルスチェック
- `POST /api/echo`: エコーエンドポイント

## ロギングシステム

- ログはデフォルトでOSごとの標準ディレクトリに出力されます。
- ログファイルはローテーション（デフォルト: 日次、最大10ファイル）され、肥大化を防ぎます。
- Docker等のコンテナ環境では自動的にコンソール出力が最小化され、ログ肥大化を抑制します。
- 以下の環境変数で挙動を制御できます：

| 環境変数         | 内容                                | デフォルト値 |
|------------------|-------------------------------------|-------------|
| LOG_ROTATION     | ログローテーション間隔 (DAILY等)    | DAILY       |
| LOG_MAX_FILES    | 保持するログファイル数               | 10          |
| LOG_BUFFER_SIZE  | ログバッファサイズ（バイト）         | 8192        |
| RUST_LOG         | ログレベル（info, debug等）          | info        |

#### Dockerでの利用例

```dockerfile
FROM rust:1.70 as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
COPY --from=builder /usr/src/app/target/release/myapp /usr/local/bin/myapp
ENV LOG_ROTATION=HOURLY
ENV LOG_MAX_FILES=5
ENV LOG_BUFFER_SIZE=16384
ENV RUST_LOG=info
CMD ["myapp"]
```

## 開発

### テスト

```bash
# すべてのテストを実行
cargo test

# テスト出力を詳細表示
cargo test -- --nocapture

# 特定のテストを実行
cargo test <test_name>

# テストカバレッジを生成
cargo tarpaulin
```

### リント

```bash
# コードの品質チェック
cargo clippy

# フォーマット
cargo fmt
```

## プロジェクト構造

```
src/
├── api.rs      # APIサーバー機能
├── cli.rs      # コマンドラインインターフェース
├── config.rs   # 設定管理
├── core.rs     # コアビジネスロジック
├── error.rs    # エラーハンドリング
├── i18n.rs     # 国際化サポート
├── lib.rs      # ライブラリのエントリーポイント
├── logging.rs  # ロギングシステム
├── main.rs     # アプリケーションのエントリーポイント
├── platform.rs # プラットフォーム固有の機能
└── utils.rs    # ユーティリティ関数
```

## 主要な依存クレート

- [tracing](https://crates.io/crates/tracing)
- [tracing-subscriber](https://crates.io/crates/tracing-subscriber)
- [tracing-appender](https://crates.io/crates/tracing-appender)
- [tempfile](https://crates.io/crates/tempfile)
- [clap](https://github.com/clap-rs/clap)
- [actix-web](https://actix.rs/)
- [serde](https://serde.rs/)
- [tokio](https://tokio.rs/)

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 貢献

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 作者

Your Name <your.email@example.com>

## 謝辞

- [Rust](https://www.rust-lang.org/)
- [Cargo](https://doc.rust-lang.org/cargo/)
- [Clap](https://github.com/clap-rs/clap)
- [Actix Web](https://actix.rs/)
- [Serde](https://serde.rs/)
- [Tokio](https://tokio.rs/)
- [tracing](https://crates.io/crates/tracing)
- [tracing-subscriber](https://crates.io/crates/tracing-subscriber)
- [tracing-appender](https://crates.io/crates/tracing-appender)
- [tempfile](https://crates.io/crates/tempfile) 
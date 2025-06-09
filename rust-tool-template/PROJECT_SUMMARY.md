# Rust Tool Template - Project Summary

## 概要

このプロジェクトは、Rust で構築された包括的な CLI ツールテンプレートです。CLI、TUI、Web API、デスクトップアプリケーション（Tauri）の機能を持つモジュラー設計になっています。

## 実装された機能

### ✅ 完成している機能

1. **コアロジック** (`src/core/`)

   - データ構造の定義 (`AppData`)
   - ビジネスロジック (`AppLogic`)
   - CRUD 操作 (作成、読み取り、更新、削除)
   - 統計情報の生成
   - データ処理機能

2. **CLI インターフェース** (`src/cli/`)

   - clap を使用したコマンドライン引数の解析
   - 対話型 TUI (Text User Interface)
   - コマンドモード（add, list, process, stats）

3. **Web API** (`src/api/`)

   - warp を使用した RESTful API
   - JSON リクエスト/レスポンス
   - エラーハンドリング
   - CORS 対応

4. **Tauri 統合** (`src/tauri/`)

   - デスクトップアプリケーション用コマンド
   - フロントエンドとの通信インターフェース

5. **テスト** (`tests/`)

   - ユニットテスト
   - 統合テスト
   - 非同期テスト対応

6. **設定とビルド**
   - Cargo.toml の依存関係設定
   - .cargo/config.toml でのプロキシ対応
   - 複数のビルドターゲット

## アーキテクチャ

### モジュール構成

```
rust-tool-template/
├── Core Module (src/core/)       # ビジネスロジック
├── CLI Module (src/cli/)         # コマンドライン/TUI
├── API Module (src/api/)         # Web API
├── Tauri Module (src/tauri/)     # デスクトップアプリ
├── Tests (tests/)                # テスト
└── Configuration                 # 設定ファイル
```

### データフロー

1. **CLI/TUI** → Core Logic → Data Operations
2. **Web API** → Handlers → Core Logic → JSON Response
3. **Tauri Commands** → Core Logic → Frontend Communication

## 技術スタック

### 主要依存関係

- **serde/serde_json**: シリアライゼーション
- **clap**: CLI 引数パース
- **anyhow**: エラーハンドリング
- **tokio**: 非同期ランタイム
- **warp**: Web フレームワーク
- **tauri**: デスクトップアプリフレームワーク

### 開発ツール

- **cargo**: ビルドシステム
- **rustup**: Rust ツールチェーン管理
- **cargo test**: テストランナー

## 使用方法

### 1. CLI モード

```bash
# データ追加
./rust-tool-template -m cli -c add -n "item" -v 100

# データ一覧
./rust-tool-template -m cli -c list

# データ処理
./rust-tool-template -m cli -c process

# 統計表示
./rust-tool-template -m cli -c stats
```

### 2. TUI モード

```bash
# インタラクティブモード（デフォルト）
./rust-tool-template
```

### 3. API サーバー

```bash
# APIサーバー起動
cargo run --bin api-server

# エンドポイント例
GET    /api/data
POST   /api/data
PUT    /api/data/{id}
DELETE /api/data/{id}
POST   /api/process
GET    /api/stats
```

### 4. Tauri デスクトップアプリ

```bash
# 開発モード
cd src-tauri && cargo tauri dev

# リリースビルド
cargo tauri build
```

## 拡張性

### 新機能の追加方法

1. **Core Logic**: `src/core/logic.rs` にビジネスロジック追加
2. **CLI**: `src/cli/mod.rs` にコマンド追加
3. **API**: `src/api/handlers.rs` にエンドポイント追加
4. **Tauri**: `src/tauri/commands.rs` にコマンド追加
5. **Tests**: `tests/` にテスト追加

### カスタマイズポイント

- データ構造 (`AppData`) の変更
- ビジネスロジック (`AppLogic`) の拡張
- API エンドポイントの追加
- CLI コマンドの追加
- UI コンポーネントの追加

## 設定

### プロキシ対応

`.cargo/config.toml` で SSL 検証無効化とプロキシ設定:

```toml
[http]
check-revoke = false
timeout = 120

[net]
retry = 5
git-fetch-with-cli = true
```

### 依存関係の管理

`Cargo.toml` で古い Rust バージョンに対応したライブラリバージョンを指定。

## 注意事項

### 現在の制限

1. **Rust バージョン**: 現在の rustup 更新が途中で止まっているため、一部の最新機能が使用できない可能性があります
2. **Web 関連**: Python ベースの web 機能は要件から除外されました
3. **リアルタイム機能**: WebSocket やリアルタイム通信は未実装

### 推奨事項

1. **Rust 更新**: 可能な時に rustup の更新を完了させる
2. **テスト拡充**: プロダクション使用前に追加テストを実装
3. **エラーハンドリング**: 本格使用時により詳細なエラー処理を追加
4. **ログ機能**: 本格運用時にログ機能を追加検討

## まとめ

このテンプレートは、Rust でのモジュラーアプリケーション開発の基盤を提供します。CLI、TUI、Web API、デスクトップアプリの各インターフェースを統一されたコアロジックで管理する設計により、様々な用途に対応可能です。

カスタマイズして、具体的なユースケースに応じたアプリケーションを構築してください。

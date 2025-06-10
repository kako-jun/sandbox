# 写真リネームツール

メタデータに基づいて写真や動画ファイルの名前を変更し整理するための強力なツールです。

## 機能

- 写真と動画ファイルの自動検出
- EXIF情報に基づく日付の取得
- 画像の向きの自動検出と修正
- 日付ベースのディレクトリ構造の作成
- 連続撮影写真のグループ化
- バックアップ機能
- 並列処理による高速化
- インタラクティブな向きの確認
- クリーンアップ機能

## インストール

```bash
cargo install photo-renamer
```

## 使用方法

基本的な使用方法:
```bash
photo-renamer -i input_dir -o output_dir
```

オプション:
- `-i, --input <DIR>`: 入力ディレクトリ
- `-o, --output <DIR>`: 出力ディレクトリ
- `-b, --backup <DIR>`: バックアップディレクトリ
- `--orientation <MODE>`: 向きの処理モード (auto/interactive/skip)
- `--cleanup`: 一時ファイルを削除
- `--parallel`: 並列処理を有効化
- `--timezone <TZ>`: 日付処理のタイムゾーン
- `--language <LANG>`: 言語 (en/ja)
- `-V, --version`: バージョン情報を表示
- `-h, --help`: ヘルプメッセージを表示

## プロジェクト構造

```
src/
├── core/
│   ├── processor.rs    # コア処理ロジック
│   └── renamer.rs      # ファイル名変更ロジック
├── media/
│   ├── date.rs         # 日付処理
│   └── orientation.rs  # 向き検出
├── utils/
│   ├── fs.rs           # ファイルシステム操作
│   └── display.rs      # ユーザーインターフェース
└── args.rs             # コマンドライン引数
```

## エラー処理

アプリケーションは`std::error::Error`を実装したカスタムエラー型を使用し、選択された言語で詳細なエラーメッセージを提供します。

## ログ機能

ログ機能は`log`クレートを使用して実装され、以下のレベルがあります：
- ERROR: 操作を妨げる重大なエラー
- WARN: 非重大な問題
- INFO: 一般的な情報
- DEBUG: 詳細なデバッグ情報
- TRACE: 非常に詳細なトレース情報

## 開発

### 依存関係

- Rust 1.70.0以上
- Cargo

### ビルド

```bash
cargo build --release
```

### テスト

```bash
cargo test
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成 
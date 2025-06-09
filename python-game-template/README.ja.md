# Python Game Template

CLIとWebインターフェースの両方をサポートし、多言語対応と包括的なエラー処理を備えた柔軟で拡張可能なゲームテンプレートです。

## 機能

- **デュアルインターフェース対応**
  - コマンドラインインターフェース（CLI）
  - Webインターフェース（FastAPI + Flask）
- **多言語対応**
  - 英語（デフォルト）
  - 日本語
- **柔軟な設定**
  - コマンドライン引数
  - 対話式プロンプト
  - Webフォーム入力
- **堅牢なエラー処理**
  - 包括的なログ記録
  - ユーザーフレンドリーなエラーメッセージ
  - 適切なフォールバック

## インストール

### ローカル開発

1. リポジトリをクローン：
```bash
git clone https://github.com/yourusername/python-game-template.git
cd python-game-template
```

2. 依存関係のインストール：
```bash
pip install -e .
```

### Docker開発

1. 開発コンテナのビルドと実行：
```bash
docker build -t python-game-dev -f docker/development/Dockerfile .
docker run -it --rm -v $(pwd):/app python-game-dev
```

## 使用方法

### CLIモード

基本的な使用方法：
```bash
python -m src.cli.main
```

コマンドライン引数を使用：
```bash
# 言語設定
python -m src.cli.main --lang ja

# プレイヤー名と難易度を設定
python -m src.cli.main --player-name "田中" --difficulty hard

# ゲームモードとボードサイズを設定
python -m src.cli.main --mode time_attack --width 15 --height 15

# 対話モードを無効化
python -m src.cli.main --no-interactive
```

利用可能なオプション：
- `--lang`: 言語設定（en/ja）
- `--player-name`: プレイヤー名
- `--difficulty`: 難易度（easy/normal/hard）
- `--mode`: ゲームモード（classic/time_attack/puzzle）
- `--width`: ボードの幅
- `--height`: ボードの高さ
- `--time-limit`: 制限時間（秒）
- `--no-interactive`: 対話モードを無効化

### Webモード

1. Docker Composeでサービスを起動：
```bash
docker-compose up
```

2. Webインターフェースにアクセス：`http://localhost:5000`

## 開発

### プロジェクト構造
```
python-game-template/
├── src/
│   ├── cli/          # CLI実装
│   ├── web/          # Webインターフェース
│   ├── api/          # APIサーバー
│   ├── game/         # ゲームコアロジック
│   └── utils/        # ユーティリティ関数
├── tests/            # テストファイル
├── logs/             # ログファイル
├── docker/
│   ├── development/  # 開発用Dockerfile
│   └── production/   # 本番用Dockerfile
├── docker-compose.yaml  # Docker Compose設定
└── pyproject.toml    # Pythonパッケージ設定
```

### テストの実行
```bash
pytest
```

### ログ記録

ログは`logs`ディレクトリに保存されます：
- `app.log`: アプリケーションログ
- `error.log`: エラーログ

ログローテーションの設定：
- 最大サイズ: 10MB
- バックアップ数: 5

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更をコミット
4. ブランチにプッシュ
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で提供されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。 
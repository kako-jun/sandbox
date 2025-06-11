# Python ゲームテンプレート

[![Tests](https://github.com/kako-jun/python-game-template/actions/workflows/test.yml/badge.svg)](https://github.com/kako-jun/python-game-template/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/kako-jun/python-game-template/branch/main/graph/badge.svg)](https://codecov.io/gh/kako-jun/python-game-template)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLIとGUIの両方に対応したクロスプラットフォームのPythonゲームテンプレートです。GUIにはPyGame、CLIには独自のクロスプラットフォーム対応ターミナルライブラリを使用しています。

## 特徴

- **デュアルインターフェース対応**: CLI（ターミナルベース）とGUI（PyGame）の両モードでゲームを実行可能
- **クロスプラットフォーム**: Windows、Linux、macOSで変更なしに動作
- **共通ゲームロジック**: CLIとGUI版でコアゲームメカニクスを共有
- **型安全性**: Pydanticモデルによる堅牢なデータ処理とバリデーション
- **国際化対応**: 多言語サポート内蔵（英語/日本語）
- **永続ストレージ**: 自動ローテーション付きの設定とセーブデータ管理
- **包括的ログ**: ファイルローテーションとパフォーマンス監視付きの構造化ログ
- **エラーハンドリング**: アプリケーションクラッシュを防ぐ堅牢なエラー管理
- **開発対応**: devcontainer、VS Code設定、CI/CDが事前設定済み

## クイックスタート

### 前提条件

- Python 3.11 以上
- Poetry（依存関係管理用）

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/kako-jun/python-game-template.git
cd python-game-template
```

2. Poetryで依存関係をインストール:
```bash
poetry install
```

3. ゲームを実行:

**GUIモード（デフォルト）:**
```bash
poetry run python src/main.py
```

**CLIモード:**
```bash
poetry run python src/main.py --mode cli
```

### VS Code での開発

1. VS Code でプロジェクトを開く
2. 推奨拡張機能をインストール
3. `F5` キーを押してゲームを実行（複数の起動設定が利用可能）

### devcontainer を使用

1. VS Code で開く
2. プロンプトが表示されたら「コンテナーで再度開く」をクリック
3. 開発環境が自動的にセットアップされます

## 使用方法

### コマンドライン オプション

```bash
poetry run python src/main.py [OPTIONS]

オプション:
  --mode {gui,cli}           ゲームモード (デフォルト: gui)
  --language {en,ja}         言語 (デフォルト: 設定から または en)
  --debug                    デバッグモードを有効にする
  --fullscreen               フルスクリーンで開始 (GUIのみ)
  --fps N                    目標FPS (デフォルト: 60)
  --width N                  ウィンドウ幅 (GUIのみ、デフォルト: 800)
  --height N                 ウィンドウ高さ (GUIのみ、デフォルト: 600)
  --log-level LEVEL          ログレベル (DEBUG/INFO/WARNING/ERROR/CRITICAL)
  --no-console-log          コンソールログを無効にする
  --no-file-log             ファイルログを無効にする
```

### 操作方法

**GUIモード:**
- `ESC`: 終了
- `スペース`: 一時停止/再開
- `R`: 再スタート

**CLIモード:**
- `Q` または `ESC`: 終了
- `P` または `スペース`: 一時停止/再開
- `R`: 再スタート

## プロジェクト構造

```
python-game-template/
├── src/
│   ├── game/              # ゲームコアロジック
│   │   ├── core.py        # 共有ゲームエンジン
│   │   ├── models.py      # Pydantic データモデル
│   │   ├── gui.py         # PyGame 実装
│   │   └── cli.py         # CLI 実装
│   ├── utils/             # ユーティリティモジュール
│   │   ├── terminal.py    # クロスプラットフォーム ターミナル制御
│   │   ├── logging.py     # ログシステム
│   │   ├── storage.py     # データ永続化
│   │   ├── i18n.py        # 国際化
│   │   └── error_handler.py # エラーハンドリング
│   ├── locales/           # 翻訳ファイル
│   └── main.py            # アプリケーション エントリーポイント
├── tests/                 # テストスイート
├── .devcontainer/         # 開発コンテナ設定
├── .vscode/               # VS Code 設定
├── .github/workflows/     # CI/CD 設定
└── pyproject.toml         # プロジェクト設定
```

## 開発

### テストの実行

```bash
# 全テストを実行
poetry run pytest

# カバレッジ付きで実行
poetry run pytest --cov=src --cov-report=html

# 特定のテストファイルを実行
poetry run pytest tests/test_models.py -v
```

### コード品質

```bash
# コードをフォーマット
poetry run black src tests

# インポートをチェック
poetry run isort src tests

# コードをリント
poetry run flake8 src tests

# 型チェック
poetry run mypy src
```

### 新しいゲームの追加

このテンプレートは複数のゲームの基盤として設計されています。新しいゲームを作成するには:

1. `src/game/core.py` の `GameEngine` クラスを拡張
2. `_update_object()` や `_handle_collision()` などのメソッドをオーバーライド
3. `src/game/models.py` にゲーム固有のモデルを追加
4. `gui.py` と `cli.py` の両方でレンダリングをカスタマイズ

## 設定

### 永続設定

アプリケーションは自動的に設定を以下の場所に保存します:
- **Windows**: `%APPDATA%/PythonGameTemplate/config/`
- **Linux/macOS**: `~/.local/share/python-game-template/config/`

### ログ

ログは同じディレクトリ構造の `logs/` 以下に自動ローテーション付きで保存されます。

## 国際化

新しい言語を追加するには:

1. `src/locales/` に新しいJSONファイルを作成（例: `fr.json`）
2. `src/game/models.py` の `Language` enumに言語を追加
3. 翻訳可能な文字列に `t()` 関数を使用

## 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を行う
4. 新機能にテストを追加
5. すべてのテストとコード品質チェックが成功することを確認
6. プルリクエストを送信

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 作者

kako-jun

## 謝辞

- GUI機能に [PyGame](https://www.pygame.org/) を使用
- データバリデーションに [Pydantic](https://pydantic-docs.helpmanual.io/) を使用
- クロスプラットフォームゲーム開発のベストプラクティスにインスパイア
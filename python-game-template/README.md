# python-game-template

## 概要
このプロジェクトは、CLIとWebブラウザの両方で遊べるゲームのテンプレートです。Pythonを使用しており、FastAPIをバックエンドのAPIとして、FlaskをWebインターフェースとして利用しています。CLIはargparseを使用してコマンドライン引数を処理し、ncursesライクなユーザーインターフェースを提供します。

## 構成
- `src/api`: FastAPIを使用したAPIモジュール
  - `main.py`: APIのエントリーポイント
  - `routes`: ゲーム関連のAPIエンドポイントを定義
- `src/cli`: コマンドラインインターフェースモジュール
  - `main.py`: CLIのエントリーポイント
  - `ui.py`: ncursesライクなUIを構築
- `src/web`: Flaskを使用したWebアプリケーションモジュール
  - `app.py`: Webアプリケーションのエントリーポイント
  - `templates`: HTMLテンプレート
  - `static`: CSSおよびJavaScriptファイル
- `src/game`: ゲームロジックモジュール
  - `core.py`: ゲームのコアロジック
  - `models.py`: ゲームのデータモデル
  - `utils.py`: ユーティリティ関数
- `tests`: テストモジュール
  - 各モジュールのユニットテストを含む

## 開発環境
- Poetryを使用して依存関係を管理
- `.devcontainer`を使用して開発環境を構築
- F5でデバッグ実行

## インストール
1. リポジトリをクローンします。
2. Poetryを使用して依存関係をインストールします。
   ```
   poetry install
   ```

## 実行方法
- CLIからの実行:
  ```
  python -m src.cli.main
  ```
- Webアプリケーションの実行:
  ```
  python -m src.web.app
  ```

## テスト
テストは`tests`ディレクトリ内にあり、以下のコマンドで実行できます。
```
pytest
```

## ライセンス
このプロジェクトはMITライセンスの下で提供されています。
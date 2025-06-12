# Python Game Template プロジェクト仕様

## プロジェクト概要

Python でゲームを作っていくための雛形になるプロジェクトです。
汎用的な基盤機能のみを提供し、各ゲームジャンルに特化した機能は含まれていません。

## 機能要件

### CUI 版

- 端末内で ncurses ライクな見た目
- 標準出力をスクロールせずに操作できる
- クロスプラットフォーム対応（Windows/Linux/macOS）
- 代替画面バッファを使用してターミナル状態を適切に管理
- VSCode 統合ターミナル対応

### GUI 版

- PyGame で作成
- 将来的には Web アプリ化したい（JavaScript や CSS は不要）

### 共通仕様

- CUI 版と GUI 版でゲームのコア部分は共通化
- 基本は PyGame 版
- `--cui`引数で CUI 版に切り替え
- 同じ main.py で両モード対応

## 技術要件

### 開発環境

- pip でなく poetry で管理
- プロジェクト内に.venv を作る
- devcontainer 対応
- 自動テスト対応
- .github での ci も実装
- .vscode を作り F5 で実行できるように（CUI と PyGame の起動し分け）
- VSCode 統合ターミナルでの動作保証

### 作者情報

- 作者名: kako-jun
- ライセンス: MIT

### エラー制御・型安全性

- エラー発生時にアプリが落ちるのを防ぐためのエラー制御
- 型ヒントを付ける
- Pydantic のスキーマを多用し、dict でなく class を中心に情報管理

### ログ・永続化

- ログは永続化、日付でのローテーション
- Docker コンテナが肥大化しないよう、compose.yaml にもログローテーション
- ユーザーホーム内やアプリのディレクトリ内にログ配置（.gitignore 対象）
- 設定画面での設定内容を永続化（ログと同じ場所）
- 常に CUI で起動する設定も可能（引数が優先）
- 型安全な設定管理（Pydantic 使用）

### 国際化

- デフォルトは英語表示
- 日本語での表示も可能
- 設定の永続化、引数での指定が優先

### ドキュメント・テスト

- ソースコードには日本語コメントを充実
- 関数にも日本語コメント
- 自動テスト項目を充実（テスト名は日本語）
- README は英語、別途日本語 README も作成
- テスト結果のバッジを表示

### サンプル実装

- このテンプレートを元に複数のゲームを作っていく予定
- サンプルゲームは実装不要
- 画面の中央に"hoge"とだけ表示

## 実装完了状況

### ✅ 完成済み機能

- **CUI/GUI 両対応**: 同一コードベースで両モード実行可能
- **クロスプラットフォーム**: Windows/Linux/macOS 対応
- **ターミナル制御**: 代替画面バッファ使用、VSCode 統合ターミナル対応
- **設定管理**: Pydantic による型安全な設定永続化
- **国際化**: 英語/日本語対応
- **ログ管理**: ローテーション機能付きログシステム
- **エラー制御**: グローバル例外ハンドラーとセーフティネット
- **開発環境**: Poetry、devcontainer、VSCode、CI/CD 完備
- **テスト基盤**: 101 テスト、62%カバレッジ達成

### 🎯 設計思想

**汎用的な基盤のみを提供**

- 音響システム、シーン管理、セーブ機能などの特化機能は含まない
- 各ゲームジャンルの要求に応じて必要な機能のみを追加可能
- 薄くて拡張しやすいアーキテクチャ

## 2025 年 6 月 12 日 仕様変更・改良

### 🔄 多重起動防止システム

- **プロセスロック機能**: PID ベースの堅牢な多重起動防止
- **相互排他制御**: CUI 版と GUI 版の同時実行を防止
- **古いロック検出**: プロセス終了後の残存ロックファイルを自動削除
- **24 時間タイムアウト**: 古いロックファイルを時刻で判定・削除
- **緊急解除機能**: `--force-unlock`オプションで強制的にロック解除
- **クロスプラットフォーム**: Windows/Unix 両対応のプロセス検出

### 🎮 同時実行モード

- **`--both`オプション**: 1 プロセスで CUI 版と GUI 版を同時表示
- **共有ゲームエンジン**: 両モードで同一のゲーム状態を共有
- **スレッドベース**: CUI 版を別スレッドで実行、GUI 版をメインスレッドで実行
- **同期管理**: 共有オーディオマネージャーとタイミングマネージャー

### 🖥️ CUI 版での PyGame 活用

- **フォント描画**: PyGame のフォント機能を CUI でも利用
- **画像処理**: PyGame の画像読み込み・操作機能を CUI バックエンドで活用
- **音響制御**: PyGame の mixer 機能で CUI 版でも音声再生可能
- **統一 API**: CUI/GUI 間で可能な限り同一の API を使用

### 🔧 GUI 表示機能拡張

- **マルチモーダル表示**: 日本語テキスト、画像、図形、カラーブロックの同時表示
- **アニメーション**: 時間ベースの図形アニメーション（拡縮、回転）
- **音楽ステータス**: リアルタイム音楽再生状況表示
- **フォント最適化**: 日本語フォント検出ログのスパム防止（1 回のみ出力）

### 🧪 テスト戦略（GUI 非表示）

- **仮想ディスプレイ**: pytest 実行時は GUI 表示を抑制
- **モック化**: PyGame の初期化とディスプレイ作成をモック
- **ヘッドレステスト**: CI 環境での GUI テスト実行
- **単体テスト**: プロセスロック、設定管理、コア機能の個別テスト

## 実装詳細

### プロセスロック実装

```python
# src/utils/process_lock.py
class ProcessLock:
    def _is_process_running(self, pid: int) -> bool:
        """PIDベースのプロセス存在確認（psutil使用、代替手段付き）"""

    def _is_lock_file_valid(self, lock_file: Path) -> bool:
        """24時間タイムアウト、PID検証によるロックファイル検証"""

    def acquire(self) -> bool:
        """コンテキストマネージャー対応のロック取得"""
```

### 同時実行モード実装

```python
# src/main.py
def run_both_modes(config: GameConfig) -> int:
    """
    CUI版: 別スレッド（daemon=True）
    GUI版: メインスレッド
    共有: GameEngine, AudioManager, TimingManager
    """
```

### GUI 表示機能拡張

```python
# src/game/gui.py
class PyGameRenderer:
    def _initialize_japanese_font(self) -> None:
        """フォントログスパム防止（_font_loggedフラグ使用）"""

    def _render(self) -> None:
        """
        - 音楽ステータス表示
        - アニメーション付き図形
        - 画像読み込み（フォールバック付き）
        - RGB色変化サークル
        - 日本語テキストサンプル
        """
```

### CUI 版 PyGame 活用

```python
# src/game/cui.py
class TerminalRenderer:
    """PyGameのフォント・画像・音響機能をCUIバックエンドで活用"""
```

## 開発・デバッグガイド

### コマンドライン オプション

```bash
# 基本実行
poetry run python src/main.py              # GUI版（デフォルト）
poetry run python src/main.py --cui-only   # CUI版のみ
poetry run python src/main.py --both       # 同時実行モード

# 多重起動制御
poetry run python src/main.py --force-unlock  # 緊急ロック解除

# その他オプション
poetry run python src/main.py --language ja --debug --fullscreen
```

### テスト実行（GUI 非表示）

```bash
# 全テスト実行（GUI表示なし）
poetry run pytest

# プロセスロック専用テスト
poetry run pytest tests/test_process_lock.py -v

# カバレッジ付きテスト
poetry run pytest --cov=src --cov-report=html
```

### ログ・設定ファイル場所

```
Windows: %USERPROFILE%/.python_game_template/
Linux/macOS: ~/.python_game_template/
├── logs/
│   ├── game_YYYY-MM-DD.log
│   └── ...
├── config/
│   └── config.json
└── temp/
    └── python_game_locks/
        ├── python_game_gui.lock
        └── python_game_cui.lock
```

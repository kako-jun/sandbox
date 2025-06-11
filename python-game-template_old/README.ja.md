# Python Game Template

[![codecov](https://codecov.io/gh/your-username/python-game-template/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/python-game-template)

モダンなアーキテクチャを持つPythonゲームのテンプレート。

## 機能

- モダンなPythonプロジェクト構造
- FastAPIベースのAPIサーバー
- ゲーム状態管理
- 多言語サポート
- テストフレームワーク
- ドキュメント

## プロジェクト構造

```
.
├── src/
│   ├── api/          # APIサーバー
│   ├── game/         # ゲームロジック
│   └── utils/        # ユーティリティ
├── tests/            # テストファイル
├── docs/             # ドキュメント
└── README.md         # このファイル
```

## はじめ方

1. 依存関係のインストール:
   ```bash
   poetry install
   ```

2. 開発サーバーの起動:
   ```bash
   poetry run uvicorn src.api.main:app --reload
   ```

3. テストの実行:
   ```bash
   poetry run pytest
   ```

## APIドキュメント

サーバーが起動したら、以下のURLにアクセス:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## テスト

このプロジェクトはpytestを使用しています。テストを実行するには:

```bash
poetry run pytest
```

### テストカバレッジ

```bash
poetry run pytest --cov=src --cov-report=term-missing
```

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作者

- kako-jun 
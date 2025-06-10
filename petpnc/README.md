# Python Tetris

CLIとWebインターフェースを持つテトリスゲームの実装です。

## インストール

```bash
pip install -r requirements.txt
```

## CLI版の実行方法

```bash
python cli/tetris_cli.py
```

オプション:
- `--width`: ボードの幅（デフォルト: 10）
- `--height`: ボードの高さ（デフォルト: 20）

例:
```bash
python cli/tetris_cli.py --width 12 --height 24
```

## 操作方法

- 左矢印: 左に移動
- 右矢印: 右に移動
- 上矢印: 回転
- 下矢印: 下に移動
- q: 終了

## プロジェクト構造

```
.
├── core/
│   └── tetris.py      # コアゲームロジック
├── cli/
│   └── tetris_cli.py  # CLIインターフェース
├── requirements.txt   # 依存パッケージ
└── README.md         # このファイル
```

## 開発予定

- [ ] Webインターフェース（Flask）の実装
- [ ] スコアの保存機能
- [ ] 難易度設定
- [ ] プレビュー機能 
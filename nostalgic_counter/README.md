# Nostalgic Counter

昔懐かしいホームページカウンターを最新技術で復活させたサービスです。

## 特徴

- 🚫 **登録不要**: ユーザー登録やログインは一切不要
- 🔒 **重複防止**: 同一IPからの24時間以内の重複アクセスを自動除外
- 📈 **多彩な統計**: 累計・今日・昨日・週間・月間の5つの期間に対応
- 🎨 **3つのスタイル**: クラシック・モダン・レトロから選択可能
- 🚀 **高性能**: Next.js + Vercel KVによる高速なレスポンス

## 使い方

### 1. 訪問カウント用スクリプト設置

あなたのWebサイトに以下のスクリプトを追加してください：

```html
<script>
fetch('https://nostalgic-counter.vercel.app/api/count?url=' + encodeURIComponent(window.location.href))
  .then(r => r.json())
  .then(d => console.log('カウント完了:', d))
  .catch(e => console.error('カウントエラー:', e));
</script>
```

### 2. カウンター画像の表示

カウンター画像を表示するには：

```html
<img src="https://nostalgic-counter.vercel.app/api/counter?url=https://yoursite.com&type=total&style=classic" alt="counter" />
```

## API パラメータ

### 期間タイプ (`type`)

- `total` - 累計（デフォルト）
- `today` - 今日
- `yesterday` - 昨日
- `week` - 直近一週間
- `month` - 直近一ヶ月

### スタイル (`style`)

- `classic` - クラシック（緑文字・黒背景）
- `modern` - モダン（白文字・グレー背景）
- `retro` - レトロ（黄文字・紫背景）

### その他のオプション

- `digits` - 表示桁数（デフォルト: 6）

## API エンドポイント

### カウンタ記録 API
```
GET/POST /api/count?url={URL}
```

### カウンタ画像 API
```
GET /api/counter?url={URL}&type={TYPE}&style={STYLE}&digits={DIGITS}
```

### 管理者 API
```
POST /api/admin?action={ACTION}&token={TOKEN}&url={URL}
```

管理者APIのアクション:
- `reset` - カウンターをリセット
- `get` - カウンター情報を取得
- `set` - カウンター値を設定

## 開発環境でのセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local

# 開発サーバーの起動
npm run dev
```

## デプロイ

Vercelにデプロイする場合：

1. Vercel KVデータベースを作成
2. 環境変数 `ADMIN_TOKEN` を設定
3. `vercel deploy` でデプロイ

## ライセンス

MIT License

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Vercel KV（本番）/ メモリ（開発）
- **デプロイ**: Vercel
- **画像生成**: SVG

## 貢献

バグレポートや機能要求は Issues からお願いします。
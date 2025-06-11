# 🔗 Nostalgic BBS

懐かしいBBS文化を現代に蘇らせるサービスです。任意のWebサイトに簡単に掲示板機能を埋め込むことができます。

## ✨ 特徴

- 📦 **簡単埋め込み**: 1行のscriptタグで任意のサイトに掲示板を追加
- 🌍 **国際対応**: 絵文字での国選択機能
- 🛡️ **荒らし対策**: 基本的なスパム検出機能
- 🔧 **管理機能**: 管理者による投稿・掲示板削除
- 💰 **完全無料**: Vercelの無料プランで運用可能
- 🔒 **プライバシー重視**: ユーザー登録不要

## 🚀 使い方

### 1. スクリプトタグで埋め込み

```html
<!-- あなたのHTMLファイルに追加 -->
<div id="nostalgic-bbs-container"></div>
<script src="https://your-domain.vercel.app/nostalgic-bbs.js"></script>
```

### 2. 自動読み込み（data属性）

```html
<!-- 自動的に現在のURLで掲示板を表示 -->
<div data-nostalgic-bbs></div>
<script src="https://your-domain.vercel.app/nostalgic-bbs.js"></script>

<!-- 特定のURLで掲示板を表示 -->
<div data-nostalgic-bbs="https://example.com/page1"></div>
```

### 3. JavaScriptで制御

```javascript
// スクリプト読み込み後
NostalgicBBS.load({
  url: 'https://example.com/page1',  // 掲示板のURL
  target: 'my-bbs-container'         // 表示先のID
});
```

## 🔧 管理機能

### 投稿の削除

```bash
curl -X DELETE https://your-domain.vercel.app/api/bbs/admin \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page1",
    "postId": "post_id_here",
    "adminKey": "your_admin_key"
  }'
```

### 掲示板全体の削除

```bash
curl -X DELETE https://your-domain.vercel.app/api/bbs/admin \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page1",
    "adminKey": "your_admin_key"
  }'
```

## 🛠️ 開発

### 環境設定

```bash
# リポジトリをクローン
git clone https://github.com/your-username/nostalgic_bbs.git
cd nostalgic_bbs

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

### ビルド

```bash
npm run build
```

## 🚀 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)にサインアップ
2. GitHubリポジトリを接続
3. 環境変数を設定:
   - `BBS_ADMIN_KEY`: 管理者用の秘密キー

### Vercel KVの設定（オプション）

本格運用時はVercel KVを使用してデータを永続化できます：

1. VercelダッシュボードでKVデータベースを作成
2. 環境変数を追加:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

## 📋 API仕様

### 投稿API
- `POST /api/bbs/post`
- Body: `{ url, author, content, country? }`

### 表示API
- `GET /api/bbs/render?url={url}`
- レスポンス: HTML

### 管理API
- `DELETE /api/bbs/admin`
- Body: `{ url, postId?, adminKey }`

## 🛡️ セキュリティ

- IPベースのレート制限（予定）
- 基本的なスパム検出
- XSS対策（HTMLエスケープ）
- 管理者キーによるアクセス制御

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューを歓迎します！
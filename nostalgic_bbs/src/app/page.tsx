export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔗 Nostalgic BBS
        </h1>
        <p className="text-center text-gray-600 mb-12">
          懐かしいBBS文化を現代に蘇らせるサービス
        </p>
        
        {/* 使用方法 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📖 使い方</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. スクリプトタグで埋め込む</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                {`<!-- あなたのHTMLファイルに追加 -->
<div id="nostalgic-bbs-container"></div>
<script src="https://your-domain.vercel.app/nostalgic-bbs.js"></script>`}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">2. 自動読み込み（data属性）</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                {`<!-- 自動的に現在のURLで掲示板を表示 -->
<div data-nostalgic-bbs></div>
<script src="https://your-domain.vercel.app/nostalgic-bbs.js"></script>

<!-- 特定のURLで掲示板を表示 -->
<div data-nostalgic-bbs="https://example.com/page1"></div>`}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">3. JavaScriptで制御</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                {`<script>
// スクリプト読み込み後
NostalgicBBS.load({
  url: 'https://example.com/page1',  // 掲示板のURL
  target: 'my-bbs-container'         // 表示先のID
});
</script>`}
              </div>
            </div>
          </div>
        </div>
        
        {/* 管理機能 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔧 管理機能</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">投稿の削除</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                {`curl -X DELETE https://your-domain.vercel.app/api/bbs/admin \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/page1",
    "postId": "post_id_here",
    "adminKey": "your_admin_key"
  }'`}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">掲示板全体の削除</h3>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                {`curl -X DELETE https://your-domain.vercel.app/api/bbs/admin \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/page1",
    "adminKey": "your_admin_key"
  }'`}
              </div>
            </div>
          </div>
        </div>
        
        {/* デモ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🚀 デモ</h2>
          <p className="text-gray-600 mb-4">以下でNostalgic BBSの動作を確認できます：</p>
          
          <div id="nostalgic-bbs-container"></div>
        </div>
      </div>
      
      <script src="/nostalgic-bbs.js"></script>
    </main>
  )
}
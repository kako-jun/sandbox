export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Nostalgic Counter
      </h1>
      <p className="text-center text-gray-600 mb-8">
        昔懐かしいホームページカウンターを最新技術で復活
      </p>
      
      <div className="max-w-4xl mx-auto">
        {/* デモ表示 */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">デモ</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <img src="/api/counter?url=https://example.com&type=total&style=classic" alt="classic style counter" />
            <img src="/api/counter?url=https://example.com&type=today&style=modern" alt="modern style counter" />
            <img src="/api/counter?url=https://example.com&type=week&style=retro" alt="retro style counter" />
          </div>
          <p className="text-sm text-gray-500">クラシック・モダン・レトロの3つのスタイルが利用可能</p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">📊 カウンター設置方法</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="mb-2 font-medium">1. 訪問数をカウントするスクリプトを設置:</p>
              <code className="block bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                {`<script>
fetch('/api/count?url=' + encodeURIComponent(window.location.href))
  .then(r => r.json())
  .then(d => console.log('カウント完了:', d));
</script>`}
              </code>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="mb-2 font-medium">2. カウンター画像を表示:</p>
              <code className="block bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                {`<img src="/api/counter?url=https://yoursite.com&type=total&style=classic" alt="counter" />`}
              </code>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">⚙️ パラメータ</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">期間タイプ (type)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-gray-200 px-1 rounded">total</code> - 累計</li>
                <li><code className="bg-gray-200 px-1 rounded">today</code> - 今日</li>
                <li><code className="bg-gray-200 px-1 rounded">yesterday</code> - 昨日</li>
                <li><code className="bg-gray-200 px-1 rounded">week</code> - 直近一週間</li>
                <li><code className="bg-gray-200 px-1 rounded">month</code> - 直近一ヶ月</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">スタイル (style)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-gray-200 px-1 rounded">classic</code> - クラシック（緑文字・黒背景）</li>
                <li><code className="bg-gray-200 px-1 rounded">modern</code> - モダン（白文字・グレー背景）</li>
                <li><code className="bg-gray-200 px-1 rounded">retro</code> - レトロ（黄文字・紫背景）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">その他のオプション</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-gray-200 px-1 rounded">digits</code> - 表示桁数（デフォルト: 6）</li>
              </ul>
            </div>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">🎯 特徴</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🚫 登録不要</h3>
              <p className="text-sm text-gray-600">ユーザー登録やログインは一切不要。URLを指定するだけで即座に利用開始</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🔒 重複防止</h3>
              <p className="text-sm text-gray-600">同一IPアドレスからの24時間以内の重複アクセスは自動的に除外</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📈 多彩な統計</h3>
              <p className="text-sm text-gray-600">累計・今日・昨日・週間・月間の5つの期間での集計に対応</p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">💡 使用例</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">ブログやWebサイトに設置:</h3>
              <code className="block bg-white p-2 rounded text-sm mt-1">
                {`<img src="/api/counter?url=https://myblog.com&type=total" alt="総訪問者数" />`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold">個別ページごとのカウンター:</h3>
              <code className="block bg-white p-2 rounded text-sm mt-1">
                {`<img src="/api/counter?url=https://myblog.com/article1&type=today" alt="今日の閲覧数" />`}
              </code>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
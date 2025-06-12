import { useEffect } from "react";

export default function Test1Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">テストページ1</h1>
      <p className="text-center text-gray-600 mb-8">カウンターテスト用のページです</p>

      <div className="max-w-4xl mx-auto">
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">このページのカウンター</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">総訪問数</h3>
              <img src="/api/counter?url=http://localhost:3000/test1&type=total&style=classic" alt="総訪問数" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">今日の訪問数</h3>
              <img src="/api/counter?url=http://localhost:3000/test1&type=today&style=modern" alt="今日の訪問数" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">今週の訪問数</h3>
              <img src="/api/counter?url=http://localhost:3000/test1&type=week&style=retro" alt="今週の訪問数" />
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              このページを訪問するとカウンターが増加します。 24時間以内の重複訪問は除外されます。
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ナビゲーション</h2>
          <div className="flex gap-4 justify-center">
            <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ホーム
            </a>
            <a href="/test2" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              テストページ2
            </a>
            <a href="/blog" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              ブログサンプル
            </a>
          </div>
        </section>
      </div>

      {/* カウント用スクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/api/count?url=' + encodeURIComponent(window.location.href))
              .then(r => r.json())
              .then(d => console.log('カウント完了:', d))
              .catch(e => console.error('カウントエラー:', e));
          `,
        }}
      />
    </main>
  );
}

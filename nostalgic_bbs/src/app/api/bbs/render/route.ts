import { NextRequest, NextResponse } from 'next/server';
import { BBSStorage } from '@/lib/storage';

const countryEmojis: { [key: string]: string } = {
  'jp': '🇯🇵',
  'us': '🇺🇸',
  'uk': '🇬🇧',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'cn': '🇨🇳',
  'kr': '🇰🇷',
  'au': '🇦🇺',
  'ca': '🇨🇦',
  'other': '🌍'
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  return date.toLocaleDateString('ja-JP');
}

function escapeHtml(text: string): string {
  const div = { innerHTML: text } as any;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function generateBBSHTML(url: string, posts: any[]): string {
  const escapedUrl = escapeHtml(url);
  
  const postsHTML = posts.map((post, index) => {
    const countryFlag = post.country ? countryEmojis[post.country] || countryEmojis.other : '';
    
    return `
      <div class="bbs-post" data-post-id="${post.id}">
        <div class="bbs-post-header">
          <span class="bbs-post-number">${index + 1}.</span>
          <span class="bbs-post-author">${escapeHtml(post.author)}</span>
          ${countryFlag ? `<span class="bbs-post-country">${countryFlag}</span>` : ''}
          <span class="bbs-post-time">${formatTimestamp(post.timestamp)}</span>
        </div>
        <div class="bbs-post-content">${escapeHtml(post.content)}</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="nostalgic-bbs" data-url="${escapedUrl}">
      <div class="bbs-header">
        <h3 class="bbs-title">💬 掲示板</h3>
        <div class="bbs-url">${escapedUrl}</div>
      </div>
      
      <div class="bbs-posts">
        ${postsHTML || '<div class="bbs-empty">まだ投稿がありません。最初の投稿をしてみませんか？</div>'}
      </div>
      
      <div class="bbs-form">
        <div class="bbs-form-group">
          <label for="bbs-author">お名前:</label>
          <input type="text" id="bbs-author" maxlength="50" placeholder="匿名さん">
        </div>
        
        <div class="bbs-form-group">
          <label for="bbs-country">国/地域:</label>
          <select id="bbs-country">
            <option value="">選択しない</option>
            <option value="jp">🇯🇵 日本</option>
            <option value="us">🇺🇸 アメリカ</option>
            <option value="uk">🇬🇧 イギリス</option>
            <option value="fr">🇫🇷 フランス</option>
            <option value="de">🇩🇪 ドイツ</option>
            <option value="cn">🇨🇳 中国</option>
            <option value="kr">🇰🇷 韓国</option>
            <option value="au">🇦🇺 オーストラリア</option>
            <option value="ca">🇨🇦 カナダ</option>
            <option value="other">🌍 その他</option>
          </select>
        </div>
        
        <div class="bbs-form-group">
          <label for="bbs-content">メッセージ:</label>
          <textarea id="bbs-content" maxlength="1000" rows="4" placeholder="メッセージを入力してください..."></textarea>
        </div>
        
        <button type="button" class="bbs-submit" onclick="submitBBSPost('${escapedUrl}')">
          投稿する
        </button>
      </div>
      
      <style>
        .nostalgic-bbs {
          max-width: 800px;
          margin: 20px 0;
          font-family: Arial, sans-serif;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }
        
        .bbs-header {
          background: #333;
          color: white;
          padding: 15px;
          border-radius: 6px 6px 0 0;
        }
        
        .bbs-title {
          margin: 0 0 5px 0;
          font-size: 18px;
        }
        
        .bbs-url {
          font-size: 12px;
          opacity: 0.8;
          word-break: break-all;
        }
        
        .bbs-posts {
          padding: 15px;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .bbs-post {
          margin-bottom: 15px;
          padding: 10px;
          background: white;
          border-radius: 5px;
          border-left: 3px solid #007bff;
        }
        
        .bbs-post-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #666;
        }
        
        .bbs-post-number {
          font-weight: bold;
          color: #007bff;
        }
        
        .bbs-post-author {
          font-weight: bold;
          color: #333;
        }
        
        .bbs-post-country {
          font-size: 14px;
        }
        
        .bbs-post-time {
          margin-left: auto;
        }
        
        .bbs-post-content {
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .bbs-empty {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px 20px;
        }
        
        .bbs-form {
          padding: 15px;
          background: #f0f0f0;
          border-top: 1px solid #ddd;
          border-radius: 0 0 6px 6px;
        }
        
        .bbs-form-group {
          margin-bottom: 12px;
        }
        
        .bbs-form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        
        .bbs-form-group input,
        .bbs-form-group select,
        .bbs-form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        .bbs-form-group textarea {
          resize: vertical;
        }
        
        .bbs-submit {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }
        
        .bbs-submit:hover {
          background: #0056b3;
        }
        
        .bbs-submit:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      </style>
      
      <script>
        async function submitBBSPost(url) {
          const author = document.getElementById('bbs-author').value.trim() || '匿名さん';
          const country = document.getElementById('bbs-country').value;
          const content = document.getElementById('bbs-content').value.trim();
          
          if (!content) {
            alert('メッセージを入力してください。');
            return;
          }
          
          const submitBtn = document.querySelector('.bbs-submit');
          submitBtn.disabled = true;
          submitBtn.textContent = '投稿中...';
          
          try {
            const response = await fetch('/api/bbs/post', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                url: url,
                author: author,
                country: country,
                content: content
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              // フォームをリセット
              document.getElementById('bbs-content').value = '';
              
              // BBSを再読み込み
              location.reload();
            } else {
              alert('投稿に失敗しました: ' + (result.error || '不明なエラー'));
            }
          } catch (error) {
            alert('投稿に失敗しました: ' + error.message);
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '投稿する';
          }
        }
      </script>
    </div>
  `;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    // BBSデータを取得
    const bbsData = await BBSStorage.getBBS(url);
    
    // HTMLを生成
    const html = generateBBSHTML(url, bbsData.posts);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Error rendering BBS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
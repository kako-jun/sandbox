(function() {
  'use strict';
  
  // 設定
  const API_BASE = window.location.origin;
  const DEFAULT_TARGET = 'nostalgic-bbs-container';
  
  // メイン関数
  function loadNostalgicBBS(options = {}) {
    const config = {
      url: options.url || window.location.href,
      target: options.target || DEFAULT_TARGET,
      apiBase: options.apiBase || API_BASE
    };
    
    // ターゲット要素を取得
    let targetElement;
    if (typeof config.target === 'string') {
      targetElement = document.getElementById(config.target);
      if (!targetElement) {
        targetElement = document.querySelector(config.target);
      }
    } else {
      targetElement = config.target;
    }
    
    if (!targetElement) {
      console.error('Nostalgic BBS: Target element not found:', config.target);
      return;
    }
    
    // ローディング表示
    targetElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">掲示板を読み込み中...</div>';
    
    // BBSを読み込み
    loadBBS(config.url, targetElement, config.apiBase);
  }
  
  // BBS読み込み関数
  function loadBBS(url, targetElement, apiBase) {
    const renderUrl = `${apiBase}/api/bbs/render?url=${encodeURIComponent(url)}`;
    
    fetch(renderUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        targetElement.innerHTML = html;
        
        // イベントリスナーを設定
        setupEventListeners(targetElement, apiBase);
      })
      .catch(error => {
        console.error('Nostalgic BBS: Error loading BBS:', error);
        targetElement.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #d32f2f; border: 1px solid #d32f2f; border-radius: 4px; background: #ffebee;">
            掲示板の読み込みに失敗しました。<br>
            <small>${error.message}</small>
          </div>
        `;
      });
  }
  
  // イベントリスナー設定
  function setupEventListeners(container, apiBase) {
    // 投稿フォームの送信処理を上書き
    const submitButton = container.querySelector('.bbs-submit');
    if (submitButton) {
      submitButton.onclick = function() {
        const url = container.querySelector('.nostalgic-bbs').dataset.url;
        if (url) {
          submitBBSPost(url, container, apiBase);
        }
      };
    }
    
    // Enterキーでの送信
    const textarea = container.querySelector('#bbs-content');
    if (textarea) {
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          const url = container.querySelector('.nostalgic-bbs').dataset.url;
          if (url) {
            submitBBSPost(url, container, apiBase);
          }
        }
      });
    }
  }
  
  // 投稿処理
  function submitBBSPost(url, container, apiBase) {
    const author = container.querySelector('#bbs-author').value.trim() || '匿名さん';
    const country = container.querySelector('#bbs-country').value;
    const content = container.querySelector('#bbs-content').value.trim();
    
    if (!content) {
      alert('メッセージを入力してください。');
      return;
    }
    
    const submitBtn = container.querySelector('.bbs-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '投稿中...';
    
    fetch(`${apiBase}/api/bbs/post`, {
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
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        // フォームをリセット
        container.querySelector('#bbs-content').value = '';
        
        // BBSを再読み込み
        const targetElement = container.parentElement || container;
        loadBBS(url, targetElement, apiBase);
      } else {
        alert('投稿に失敗しました: ' + (result.error || '不明なエラー'));
      }
    })
    .catch(error => {
      alert('投稿に失敗しました: ' + error.message);
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = '投稿する';
    });
  }
  
  // グローバル関数として公開
  window.NostalgicBBS = {
    load: loadNostalgicBBS,
    version: '1.0.0'
  };
  
  // 自動読み込み（data-nostalgic-bbs属性がある要素を探す）
  function autoLoad() {
    const elements = document.querySelectorAll('[data-nostalgic-bbs]');
    elements.forEach(element => {
      const url = element.dataset.nostalgicBbs || window.location.href;
      loadBBS(url, element, API_BASE);
    });
  }
  
  // DOM読み込み完了後に自動読み込み
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoad);
  } else {
    autoLoad();
  }
  
})();
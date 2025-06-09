// ゲームの状態
let gameState = null;
let gameLoop = null;
let isPaused = false;

// キャンバスの設定
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 20;

// ゲーム状態の更新
async function updateGameState() {
    try {
        const response = await fetch('/api/game/state');
        gameState = await response.json();
        drawGame();
        updateInfo();
    } catch (error) {
        console.error('ゲーム状態の取得に失敗しました:', error);
    }
}

// ゲームの描画
function drawGame() {
    if (!gameState) return;
    
    // キャンバスのサイズを設定
    canvas.width = gameState.board_size.width * CELL_SIZE;
    canvas.height = gameState.board_size.height * CELL_SIZE;
    
    // 背景をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 蛇の描画
    ctx.fillStyle = '#4CAF50';
    gameState.snake_body.forEach(pos => {
        ctx.fillRect(pos.x * CELL_SIZE, pos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
    
    // 餌の描画
    if (gameState.food_position) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(
            (gameState.food_position.x + 0.5) * CELL_SIZE,
            (gameState.food_position.y + 0.5) * CELL_SIZE,
            CELL_SIZE / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// ゲーム情報の更新
function updateInfo() {
    if (!gameState) return;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('time').textContent = gameState.tick_count;
}

// 移動の処理
async function move(direction) {
    if (isPaused) return;
    
    try {
        const response = await fetch('/api/game/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ direction }),
        });
        gameState = await response.json();
        drawGame();
        updateInfo();
        
        if (gameState.is_game_over) {
            clearInterval(gameLoop);
            alert('ゲームオーバー！');
        }
    } catch (error) {
        console.error('移動に失敗しました:', error);
    }
}

// ゲームのリセット
async function resetGame() {
    try {
        const response = await fetch('/api/game/reset', {
            method: 'POST',
        });
        gameState = await response.json();
        drawGame();
        updateInfo();
        
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        gameLoop = setInterval(updateGameState, 100);
    } catch (error) {
        console.error('ゲームのリセットに失敗しました:', error);
    }
}

// 設定の適用
async function applySettings() {
    const config = {
        board_width: parseInt(document.getElementById('board-width').value),
        board_height: parseInt(document.getElementById('board-height').value),
        difficulty: document.getElementById('difficulty').value,
        game_mode: document.getElementById('game-mode').value,
        time_limit: parseInt(document.getElementById('time-limit').value) || null,
    };
    
    try {
        const response = await fetch('/api/game/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });
        gameState = await response.json();
        drawGame();
        updateInfo();
    } catch (error) {
        console.error('設定の適用に失敗しました:', error);
    }
}

// キーボードコントロール
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            move('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            move('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            move('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            move('right');
            break;
        case ' ':
            isPaused = !isPaused;
            break;
    }
});

// ボタンのイベントリスナー
document.getElementById('start-game').addEventListener('click', () => {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    gameLoop = setInterval(updateGameState, 100);
});

document.getElementById('reset-game').addEventListener('click', resetGame);
document.getElementById('apply-settings').addEventListener('click', applySettings);

// 初期状態の取得
updateGameState();
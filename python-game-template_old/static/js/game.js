document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const startButton = document.getElementById('start-game');
    const resetButton = document.getElementById('reset-game');
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');

    let gameState = null;
    let gameInterval = null;
    const playerId = 0;  // 固定のプレイヤーID

    async function updateGameState() {
        try {
            const response = await fetch(`/api/game/${playerId}`);
            gameState = await response.json();
            updateUI();
        } catch (error) {
            console.error('Error updating game state:', error);
        }
    }

    function updateUI() {
        if (!gameState) return;

        scoreElement.textContent = gameState.score;
        timeElement.textContent = gameState.tick_count;

        // TODO: Update game board visualization
    }

    async function startGame() {
        try {
            await fetch(`/api/game/${playerId}`, { method: 'POST' });
            gameInterval = setInterval(updateGameState, 1000);
            startButton.disabled = true;
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    async function resetGame() {
        try {
            await fetch(`/api/game/${playerId}`, { method: 'POST' });
            clearInterval(gameInterval);
            startButton.disabled = false;
            updateGameState();
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    }

    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);

    // Initial state update
    updateGameState();
}); 
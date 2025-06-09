import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routes import game as game_routes
from ..game.core import Game
from ..game.models import GameState, GameConfig, Player, Position, Direction, GameAction, Difficulty, GameMode
from pydantic import BaseModel
from typing import Tuple, Dict, List, Optional, Any, Union
from fastapi.responses import Response, JSONResponse
import logging
from datetime import datetime
import time

# ロガーの設定
logger = logging.getLogger(__name__)

# FastAPIアプリケーションの作成
app = FastAPI(
    title="Snake Game API",
    description="Python Snake GameのAPI",
    version="1.0.0"
)

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ゲームインスタンスの管理
games: Dict[str, Game] = {}

# ルーターを追加
app.include_router(game_routes.router, prefix="/game", tags=["game"])

class PositionResponse(BaseModel):
    """位置情報のレスポンスモデル"""
    x: int
    y: int

class BoardSizeResponse(BaseModel):
    """ボードサイズのレスポンスモデル"""
    width: int
    height: int

class GameStateResponse(BaseModel):
    """ゲーム状態のレスポンスモデル"""
    player_position: Optional[PositionResponse]
    score: int
    is_game_over: bool
    board_size: Optional[BoardSizeResponse]
    food_position: Optional[PositionResponse]
    snake_body: List[PositionResponse]
    tick_count: int

class MoveRequest(BaseModel):
    """移動リクエストのモデル"""
    direction: Direction

@app.get("/")
async def read_root():
    """ルートエンドポイント"""
    return {
        "name": "Snake Game API",
        "version": "1.0.0",
        "author": "Your Name"
    }

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}

@app.post("/games", response_model=GameState)
async def create_game(player_name: str, config: Optional[GameConfig] = None):
    """新しいゲームを作成"""
    if not config:
        config = GameConfig()
    
    game = Game(config=config)
    state = game.initialize_game(player_name)
    if not state:
        raise HTTPException(status_code=400, detail="Failed to initialize game")
    
    games[player_name] = game
    return state

@app.get("/games/{player_name}", response_model=GameState)
async def get_game_state(player_name: str):
    """ゲームの状態を取得"""
    game = games.get(player_name)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    state = game.get_state()
    if not state:
        raise HTTPException(status_code=400, detail="Game state not available")
    
    return state

@app.post("/games/{player_name}/move")
async def move_snake(player_name: str, direction: Direction):
    """蛇を移動"""
    game = games.get(player_name)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if not game.move(direction):
        raise HTTPException(status_code=400, detail="Invalid move")
    
    state = game.get_state()
    if not state:
        raise HTTPException(status_code=400, detail="Game state not available")
    
    return state

@app.post("/games/{player_name}/tick")
async def tick_game(player_name: str):
    """ゲームの状態を更新"""
    game = games.get(player_name)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    state = game.tick()
    if not state:
        raise HTTPException(status_code=400, detail="Game state not available")
    
    return state

@app.post("/games/{player_name}/reset")
async def reset_game(player_name: str):
    """ゲームをリセット"""
    game = games.get(player_name)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    state = game.reset()
    if not state:
        raise HTTPException(status_code=400, detail="Failed to reset game")
    
    return state

@app.delete("/games/{player_name}")
async def delete_game(player_name: str):
    """ゲームを削除"""
    if player_name not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    del games[player_name]
    return {"message": "Game deleted successfully"}

def main():
    """APIサーバーを起動する"""
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=10400, reload=True, log_level="info")

if __name__ == "__main__":
    main()

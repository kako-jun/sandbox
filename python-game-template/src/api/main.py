import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routes import game
from pydantic import BaseModel
from typing import Tuple

from src.game.core import Game, Direction, GameState

# Create FastAPI app
app = FastAPI(
    title="Python Snake Game API",
    description="A FastAPI backend for the Snake game supporting both CLI and web interfaces",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware for web interface
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game.router, prefix="/api/v1")

game = Game()


class MoveRequest(BaseModel):
    direction: str


class GameStateResponse(BaseModel):
    player_position: dict
    score: int
    is_game_over: bool
    board_size: Tuple[int, int]


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Python Snake Game API!",
        "version": "0.1.0",
        "author": "kako-jun",
        "endpoints": {"docs": "/docs", "redoc": "/redoc", "game": "/api/v1/game/", "health": "/health"},
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "python-snake-game-api", "version": "0.1.0"}


@app.get("/game/state", response_model=GameStateResponse)
async def get_game_state():
    return {
        "player_position": {
            "x": game.state.player_position.x,
            "y": game.state.player_position.y
        },
        "score": game.state.score,
        "is_game_over": game.state.is_game_over,
        "board_size": game.state.board_size
    }


@app.post("/game/move")
async def move(request: MoveRequest):
    try:
        direction = Direction(request.direction)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid direction")
    
    state = game.move(direction)
    return {
        "player_position": {
            "x": state.player_position.x,
            "y": state.player_position.y
        },
        "score": state.score,
        "is_game_over": state.is_game_over,
        "board_size": state.board_size
    }


@app.post("/game/reset")
async def reset():
    state = game.reset()
    return {
        "player_position": {
            "x": state.player_position.x,
            "y": state.player_position.y
        },
        "score": state.score,
        "is_game_over": state.is_game_over,
        "board_size": state.board_size
    }


def main():
    """Run the API server"""
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")


if __name__ == "__main__":
    main()

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from uuid import uuid4
from ...game.core import SnakeGame
from ...game.models import GameConfig, GameAction, Direction

router = APIRouter(prefix="/game", tags=["game"])

# Store active game sessions
game_sessions: Dict[str, SnakeGame] = {}


@router.get("/info")
async def get_game_info():
    """Get general game information"""
    return {
        "name": "Snake Game",
        "version": "0.1.0",
        "author": "kako-jun",
        "description": "A classic Snake game with API support",
        "active_sessions": len(game_sessions),
    }


@router.post("/create")
async def create_game(player_name: str = "API Player"):
    """Create a new game session"""
    session_id = str(uuid4())
    config = GameConfig(board_width=20, board_height=15, game_name="API Snake Game", tick_speed=0.2)

    game = SnakeGame(config)
    game.initialize_game(player_name)
    game_sessions[session_id] = game

    return {
        "session_id": session_id,
        "message": "Game created successfully",
        "player_name": player_name,
        "board_size": {"width": config.board_width, "height": config.board_height},
    }


@router.get("/sessions/{session_id}/state")
async def get_game_state(session_id: str):
    """Get current game state"""
    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")

    game = game_sessions[session_id]
    state = game.get_state()
    board = game.get_board()

    if not state or not board:
        raise HTTPException(status_code=500, detail="Game state unavailable")

    return {
        "session_id": session_id,
        "game_state": state.dict(),
        "board": {
            "width": board.width,
            "height": board.height,
            "cells": [[cell.value for cell in row] for row in board.cells],
        },
    }


@router.post("/sessions/{session_id}/action")
async def perform_action(session_id: str, action_type: str, direction: str = None):
    """Perform a game action"""
    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")

    game = game_sessions[session_id]

    # Validate direction if provided
    game_direction = None
    if direction:
        try:
            game_direction = Direction(direction.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid direction: {direction}")

    # Create action
    action = GameAction(player_id=0, action_type=action_type, direction=game_direction)

    # Process action
    success = game.process_action(action)
    state = game.get_state()

    if not state:
        raise HTTPException(status_code=500, detail="Game state unavailable")

    return {
        "session_id": session_id,
        "action_processed": success,
        "game_over": state.game_over,
        "score": state.players[0].score if state.players else 0,
        "message": "Game over!" if state.game_over else "Action processed",
    }


@router.delete("/sessions/{session_id}")
async def delete_game_session(session_id: str):
    """Delete a game session"""
    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")

    del game_sessions[session_id]
    return {"session_id": session_id, "message": "Game session deleted successfully"}


@router.get("/sessions")
async def list_game_sessions():
    """List all active game sessions"""
    sessions = []
    for session_id, game in game_sessions.items():
        state = game.get_state()
        if state:
            sessions.append(
                {
                    "session_id": session_id,
                    "player_name": state.players[0].name if state.players else "Unknown",
                    "score": state.players[0].score if state.players else 0,
                    "game_over": state.game_over,
                    "tick_count": state.tick_count,
                }
            )

    return {"total_sessions": len(sessions), "sessions": sessions}

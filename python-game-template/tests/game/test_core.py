import os
import sys
import time
import json
import logging
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from src.game.core import Game
from src.game.models import GameState, GameConfig, Player, Position, Direction, GameAction, Difficulty, GameMode

def test_game_initialization() -> None:
    """Gameの初期化をテストする"""
    game = Game()
    state = game.initialize_game("player1")
    assert state is not None
    assert isinstance(state, GameState)
    assert state.players["player1"] is not None
    assert state.current_player_id == "player1"
    assert not state.game_over

def test_game_tick() -> None:
    """Gameのティック処理をテストする"""
    game = Game()
    game.initialize_game("player1")
    state = game.tick()
    assert state is not None
    assert isinstance(state, GameState)
    assert state.tick_count > 0

def test_game_process_action() -> None:
    """Gameのアクション処理をテストする"""
    game = Game()
    game.initialize_game("player1")
    
    # 有効なアクション
    action = GameAction(player_id="player1", action_type="move", direction=Direction.UP)
    assert game.process_action(action)
    
    # 無効なアクション
    action = GameAction(player_id="invalid", action_type="move", direction=Direction.UP)
    assert not game.process_action(action)

def test_game_get_state() -> None:
    """Gameの状態取得をテストする"""
    game = Game()
    game.initialize_game("player1")
    state = game.get_state()
    assert state is not None
    assert isinstance(state, GameState)
    assert state.players["player1"] is not None
    assert state.current_player_id == "player1"

def test_game_reset() -> None:
    """Gameのリセットをテストする"""
    game = Game()
    game.initialize_game("player1")
    state = game.reset()
    assert state is not None
    assert isinstance(state, GameState)
    assert not state.game_over
    assert state.tick_count == 0

def test_game_configure() -> None:
    """Gameの設定変更をテストする"""
    game = Game()
    game.initialize_game("player1")
    
    config = GameConfig(
        board_width=30,
        board_height=30,
        difficulty=Difficulty.HARD,
        game_mode=GameMode.CLASSIC,
        time_limit=300
    )
    
    state = game.configure(config)
    assert state is not None
    assert isinstance(state, GameState)
    assert state.board_width == 30
    assert state.board_height == 30

def test_game_collision_detection() -> None:
    """Gameの衝突検出をテストする"""
    game = Game()
    game.initialize_game("player1")
    
    # 壁との衝突
    state = game.get_state()
    if state:
        player = state.players["player1"]
        player.snake_body = [Position(x=-1, y=0)]  # 壁の外に移動
        state.players["player1"] = player
    
    state = game.tick()
    assert state is not None
    assert state.game_over

def test_game_food_collection() -> None:
    """Gameの餌の収集をテストする"""
    game = Game()
    game.initialize_game("player1")
    
    # 餌の位置に移動
    state = game.get_state()
    if state and state.food_position:
        player = state.players["player1"]
        player.snake_body = [state.food_position]
        state.players["player1"] = player
    
    state = game.tick()
    assert state is not None
    assert state.players["player1"].score > 0

def test_game_snake_growth() -> None:
    """Gameの蛇の成長をテストする"""
    game = Game()
    game.initialize_game("player1")
    
    # 餌を食べる
    state = game.get_state()
    if state and state.food_position:
        player = state.players["player1"]
        player.snake_body = [state.food_position]
        state.players["player1"] = player
    
    initial_length = len(state.players["player1"].snake_body) if state else 0
    state = game.tick()
    assert state is not None
    assert len(state.players["player1"].snake_body) > initial_length

def test_game_time_limit() -> None:
    """Gameの時間制限をテストする"""
    game = Game()
    config = GameConfig(
        board_width=20,
        board_height=20,
        difficulty=Difficulty.NORMAL,
        game_mode=GameMode.TIME_ATTACK,
        time_limit=1
    )
    game.configure(config)
    game.initialize_game("player1")
    
    # 時間経過をシミュレート
    time.sleep(1.1)
    state = game.tick()
    assert state is not None
    assert state.game_over 
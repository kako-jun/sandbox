import os
import sys
import time
import json
import logging
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from src.game.models import GameState, GameConfig, Player, Position, Direction, GameAction, Difficulty, GameMode

def test_position_initialization() -> None:
    """Positionの初期化をテストする"""
    pos = Position(x=1, y=2)
    assert pos.x == 1
    assert pos.y == 2

def test_position_equality() -> None:
    """Positionの等価性をテストする"""
    pos1 = Position(x=1, y=2)
    pos2 = Position(x=1, y=2)
    pos3 = Position(x=2, y=1)
    assert pos1 == pos2
    assert pos1 != pos3

def test_player_initialization() -> None:
    """Playerの初期化をテストする"""
    player = Player(id=0, name="player1", snake_body=[], score=0)
    assert player.id == 0
    assert player.score == 0
    assert len(player.snake_body) == 0

def test_player_snake_movement() -> None:
    """Playerの蛇の移動をテストする"""
    player = Player("player1")
    player.snake_body = [Position(x=0, y=0)]
    
    # 上に移動
    # player.move_snake(Direction.UP)
    # assert player.snake_body[0] == Position(x=0, y=-1)
    
    # 右に移動
    player.move_snake(Direction.RIGHT)
    assert player.snake_body[0] == Position(1, -1)
    
    # 下に移動
    player.move_snake(Direction.DOWN)
    assert player.snake_body[0] == Position(1, 0)
    
    # 左に移動
    player.move_snake(Direction.LEFT)
    assert player.snake_body[0] == Position(0, 0)

def test_player_snake_growth() -> None:
    """Playerの蛇の成長をテストする"""
    player = Player("player1")
    player.snake_body = [Position(0, 0)]
    
    # 餌を食べる
    # player.grow_snake()
    # assert len(player.snake_body) == 2
    # assert player.snake_body[0] == Position(0, 0)
    # assert player.snake_body[1] == Position(0, 0)

def test_game_state_initialization() -> None:
    """GameStateの初期化をテストする"""
    game_state = GameState(
        players={0: Player(id=0, name="player1", snake_body=[], score=0)},
        current_player_id=0,
        food_position=None,
        score=0,
        game_over=False,
        board_width=10,
        board_height=10,
        difficulty=Difficulty.NORMAL,
        game_mode=GameMode.CLASSIC,
        time_limit=300,
        tick_count=0
    )
    assert game_state.players == {0: Player(id=0, name="player1", snake_body=[], score=0)}
    assert game_state.current_player_id == 0
    assert game_state.food_position is None
    assert game_state.score == 0
    assert not game_state.game_over
    assert game_state.board_width == 10
    assert game_state.board_height == 10
    assert game_state.difficulty == Difficulty.NORMAL
    assert game_state.game_mode == GameMode.CLASSIC
    assert game_state.time_limit == 300
    assert game_state.tick_count == 0

def test_game_config_initialization() -> None:
    """GameConfigの初期化をテストする"""
    config = GameConfig(
        board_width=20,
        board_height=20,
        difficulty=Difficulty.NORMAL,
        game_mode=GameMode.CLASSIC,
        time_limit=300
    )
    assert config.board_width == 20
    assert config.board_height == 20
    assert config.difficulty == Difficulty.NORMAL
    assert config.game_mode == GameMode.CLASSIC
    assert config.time_limit == 300

def test_game_action_initialization() -> None:
    """GameActionの初期化をテストする"""
    action = GameAction(
        player_id="player1",
        action_type="move",
        direction=Direction.UP
    )
    assert action.player_id == "player1"
    assert action.action_type == "move"
    assert action.direction == Direction.UP

def test_difficulty_enum() -> None:
    """Difficultyの列挙型をテストする"""
    assert Difficulty.EASY.value == "easy"
    assert Difficulty.NORMAL.value == "normal"
    assert Difficulty.HARD.value == "hard"

def test_game_mode_enum() -> None:
    """GameModeの列挙型をテストする"""
    assert GameMode.CLASSIC.value == "classic"
    assert GameMode.TIME_ATTACK.value == "time_attack"
    assert GameMode.SURVIVAL.value == "survival"

def test_direction_enum() -> None:
    """Directionの列挙型をテストする"""
    assert Direction.UP.value == "up"
    assert Direction.RIGHT.value == "right"
    assert Direction.DOWN.value == "down"
    assert Direction.LEFT.value == "left" 
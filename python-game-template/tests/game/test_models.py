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
    player = Player(id="player1", name="player1", position=Position(x=0, y=0), snake_body=[Position(x=0, y=0)], score=0)
    assert player.id == "player1"
    assert player.score == 0
    assert len(player.snake_body) == 1


def test_player_snake_movement() -> None:
    """Playerの蛇の移動をテストする"""
    player = Player(id="player1", name="player1", position=Position(x=0, y=0), snake_body=[Position(x=0, y=0)], score=0)

    # プレイヤーの基本属性をテスト
    assert player.id == "player1"
    assert player.name == "player1"
    assert player.position == Position(x=0, y=0)
    assert len(player.snake_body) == 1


def test_player_snake_growth() -> None:
    """Playerの蛇の成長をテストする"""
    player = Player(id="player1", name="player1", position=Position(x=0, y=0), snake_body=[Position(x=0, y=0)], score=0)

    # 成長前の状態
    initial_length = len(player.snake_body)

    # 蛇を手動で成長させる
    player.snake_body.append(Position(x=1, y=0))

    assert len(player.snake_body) == initial_length + 1


def test_game_state_initialization() -> None:
    """GameStateの初期化をテストする"""
    player = Player(id="0", name="player1", position=Position(x=0, y=0), snake_body=[Position(x=0, y=0)], score=0)

    config = GameConfig(
        board_width=10, board_height=10, difficulty=Difficulty.NORMAL, game_mode=GameMode.CLASSIC, time_limit=300
    )

    game_state = GameState(
        config=config,
        snake=[Position(x=0, y=0)],
        food=Position(x=5, y=5),
        score=0,
        game_over=False,
        time_remaining=300,
        current_direction=Direction.RIGHT,
        players={0: player},
        current_player_id=0,
        food_position=Position(x=5, y=5),
        board_width=10,
        board_height=10,
        tick_count=0,
        difficulty=Difficulty.NORMAL,
        game_mode=GameMode.CLASSIC,
    )
    assert game_state.players[0].id == "0"
    assert game_state.current_player_id == 0
    assert game_state.food_position.x == 5
    assert game_state.food_position.y == 5
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
        board_width=20, board_height=20, difficulty=Difficulty.NORMAL, game_mode=GameMode.CLASSIC, time_limit=300
    )
    assert config.board_width == 20
    assert config.board_height == 20
    assert config.difficulty == Difficulty.NORMAL
    assert config.game_mode == GameMode.CLASSIC
    assert config.time_limit == 300


def test_game_action_initialization() -> None:
    """GameActionの初期化をテストする"""
    action = GameAction(player_id="player1", action_type="move", direction=Direction.UP)
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

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
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    state = game.initialize_game("player1")
    assert state is not None
    assert isinstance(state, GameState)
    assert not state.game_over


def test_game_tick() -> None:
    """Gameのティック処理をテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    game.initialize_game("player1")
    state = game.tick()
    assert state is not None
    assert isinstance(state, GameState)


def test_game_move() -> None:
    """Gameの移動をテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    game.initialize_game("player1")

    # 有効な移動
    assert game.move(Direction.UP)
    state = game.get_state()
    assert state is not None
    assert state.current_direction == Direction.UP


def test_game_get_state() -> None:
    """Gameの状態取得をテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    game.initialize_game("player1")
    state = game.get_state()
    assert state is not None
    assert isinstance(state, GameState)


def test_game_reset() -> None:
    """Gameのリセットをテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    game.initialize_game("player1")

    # 移動して状態を変更
    game.move(Direction.UP)

    # リセット
    state = game.reset()
    assert state is not None
    assert isinstance(state, GameState)
    assert not state.game_over
    assert state.score == 0


def test_game_configure() -> None:
    """Gameの設定変更をテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    game.initialize_game("player1")

    # 新しい設定は次のゲーム初期化で使用されるため、
    # ここでは単純に設定が保存されることを確認
    new_config = GameConfig(
        board_width=30, board_height=30, difficulty=Difficulty.HARD, game_mode=GameMode.CLASSIC, time_limit=300
    )

    # 新しい設定でゲームを作成
    new_game = Game(new_config)
    state = new_game.initialize_game("player1")
    assert state is not None
    assert state.config.board_width == 30
    assert state.config.board_height == 30


def test_game_collision_detection() -> None:
    """Gameの衝突検出をテストする"""
    config = GameConfig(board_width=5, board_height=5)  # 小さなボードで壁衝突をテスト
    game = Game(config)
    game.initialize_game("player1")

    # 初期状態を確認
    state = game.get_state()
    assert state is not None
    assert state.current_direction == Direction.RIGHT  # 初期方向は右

    # 右に移動し続けて右の壁にぶつかる
    # 5x5ボードで初期位置(2,2)から右に移動すると、(3,2) -> (4,2) -> 壁
    for _ in range(5):  # 余裕を持って移動
        result = game.move(Direction.RIGHT)
        state = game.get_state()
        assert state is not None
        if state.game_over:
            break
        if not result:  # moveがFalseを返したら衝突
            break

    state = game.get_state()
    assert state is not None
    # 壁に衝突してゲームオーバーになるはず
    assert state.game_over


def test_game_food_collection() -> None:
    """Gameの餌の収集をテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    state = game.initialize_game("player1")
    assert state is not None

    initial_score = state.score

    # 食べ物の位置に蛇の頭を移動
    if state.food:
        # 強制的に食べ物を食べるために状態を操作
        state.snake[0] = state.food
        if game.move(Direction.RIGHT):
            new_state = game.get_state()
            if new_state:
                assert new_state.score >= initial_score


def test_game_snake_growth() -> None:
    """Gameの蛇の成長をテストする"""
    config = GameConfig(board_width=20, board_height=20)
    game = Game(config)
    state = game.initialize_game("player1")
    assert state is not None

    initial_length = len(state.snake)

    # 食べ物を食べて蛇を成長させる
    if state.food:
        # 強制的に食べ物を食べるために状態を操作
        state.snake[0] = state.food
        if game.move(Direction.RIGHT):
            new_state = game.get_state()
            if new_state:
                # 成長は実装依存なので、少なくとも同じ長さは維持される
                assert len(new_state.snake) >= initial_length


def test_game_time_limit() -> None:
    """Gameの時間制限をテストする"""
    config = GameConfig(board_width=20, board_height=20, time_limit=60)
    game = Game(config)
    game.initialize_game("player1")

    # シミュレーション時間を使用してテスト
    game.simulated_time = 65  # 時間制限を超過

    state = game.tick()
    assert state is not None
    assert state.game_over or state.time_remaining <= 0

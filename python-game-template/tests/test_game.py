import pytest
from src.game.core import Game
from src.game.models import GameConfig, Direction, Position, GameState

@pytest.fixture
def game_config():
    return GameConfig(
        width=20,
        height=20,
        initial_speed=1.0,
        speed_increase=0.1,
        food_value=10,
        time_limit=300
    )

@pytest.fixture
def game(game_config):
    return Game(config=game_config)

def test_game_initialization(game, game_config):
    """ゲームの初期化をテスト"""
    state = game.initialize_game("Player 1")
    assert state is not None
    assert isinstance(state, GameState)
    assert state.config == game_config
    assert len(state.snake) == 1
    assert state.score == 0
    assert not state.game_over
    assert state.time_remaining == game_config.time_limit
    assert state.current_direction == Direction.RIGHT

def test_game_movement(game):
    """ゲームの移動をテスト"""
    game.initialize_game("Player 1")
    state = game.get_state()
    assert state is not None
    
    # 右に移動
    assert game.move(Direction.RIGHT)
    state = game.get_state()
    assert state is not None
    assert state.snake[0].x == state.config.width // 2 + 1
    assert state.snake[0].y == state.config.height // 2

    # 下に移動
    assert game.move(Direction.DOWN)
    state = game.get_state()
    assert state is not None
    assert state.snake[0].x == state.config.width // 2 + 1
    assert state.snake[0].y == state.config.height // 2 + 1

def test_game_collision_detection(game):
    """衝突検出をテスト"""
    game.initialize_game("Player 1")
    state = game.get_state()
    assert state is not None

    # 壁との衝突
    for _ in range(state.config.width):
        game.move(Direction.RIGHT)
    state = game.get_state()
    assert state is not None
    assert state.game_over

    # ゲームをリセット
    game.reset()
    state = game.get_state()
    assert state is not None

    # 自身との衝突
    game.move(Direction.RIGHT)
    game.move(Direction.DOWN)
    game.move(Direction.LEFT)
    game.move(Direction.UP)
    state = game.get_state()
    assert state is not None
    assert state.game_over

def test_game_food_collection(game):
    """食べ物の収集をテスト"""
    game.initialize_game("Player 1")
    state = game.get_state()
    assert state is not None

    # 食べ物の位置を取得
    food_pos = state.food

    # 食べ物に向かって移動
    if food_pos.x > state.snake[0].x:
        game.move(Direction.RIGHT)
    elif food_pos.x < state.snake[0].x:
        game.move(Direction.LEFT)
    if food_pos.y > state.snake[0].y:
        game.move(Direction.DOWN)
    elif food_pos.y < state.snake[0].y:
        game.move(Direction.UP)

    # スコアが増加しているか確認
    state = game.get_state()
    assert state is not None
    assert state.score > 0

def test_game_time_limit(game):
    """時間制限をテスト"""
    game.initialize_game("Player 1")
    state = game.get_state()
    assert state is not None

    # 時間を進める
    for _ in range(state.config.time_limit + 1):
        game.tick()

    state = game.get_state()
    assert state is not None
    assert state.game_over
    assert state.time_remaining == 0

def test_game_reset(game):
    """ゲームのリセットをテスト"""
    game.initialize_game("Player 1")
    state = game.get_state()
    assert state is not None

    # ゲームを進行
    game.move(Direction.RIGHT)
    game.move(Direction.DOWN)
    game.tick()

    # リセット
    new_state = game.reset()
    assert new_state is not None
    assert new_state.score == 0
    assert not new_state.game_over
    assert new_state.time_remaining == state.config.time_limit
    assert len(new_state.snake) == 1
    assert new_state.current_direction == Direction.RIGHT
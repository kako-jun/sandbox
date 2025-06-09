import pytest
from src.game.core import Direction, Game, GameState, Position

def test_game_initialization(game):
    assert isinstance(game.state, GameState)
    assert game.state.score == 0
    assert not game.state.is_game_over
    assert game.state.board_size == (10, 10)

def test_player_movement(game):
    initial_x = game.state.player_position.x
    initial_y = game.state.player_position.y

    # Move right
    game.move(Direction.RIGHT)
    assert game.state.player_position.x == initial_x + 1
    assert game.state.player_position.y == initial_y

    # Move down
    game.move(Direction.DOWN)
    assert game.state.player_position.x == initial_x + 1
    assert game.state.player_position.y == initial_y + 1

    # Move left
    game.move(Direction.LEFT)
    assert game.state.player_position.x == initial_x
    assert game.state.player_position.y == initial_y + 1

    # Move up
    game.move(Direction.UP)
    assert game.state.player_position.x == initial_x
    assert game.state.player_position.y == initial_y

def test_boundary_collision(game):
    # Move to the right edge
    for _ in range(game.state.board_size[0]):
        game.move(Direction.RIGHT)
    assert game.state.is_game_over

    # Reset game
    game.reset()
    assert not game.state.is_game_over

    # Move to the bottom edge
    for _ in range(game.state.board_size[1]):
        game.move(Direction.DOWN)
    assert game.state.is_game_over

def test_score_increment(game):
    initial_score = game.state.score
    game.move(Direction.RIGHT)
    assert game.state.score == initial_score + 1

def test_game_reset(game):
    # Make some moves
    game.move(Direction.RIGHT)
    game.move(Direction.DOWN)
    initial_score = game.state.score

    # Reset game
    game.reset()
    assert game.state.score == 0
    assert not game.state.is_game_over
    assert game.state.player_position.x == game.state.board_size[0] // 2
    assert game.state.player_position.y == game.state.board_size[1] // 2
import pytest
from src.game.core import Game

def test_game_initialization():
    game = Game()
    assert game is not None
    assert game.state == "initialized"

def test_game_start():
    game = Game()
    game.start()
    assert game.state == "running"

def test_game_pause():
    game = Game()
    game.start()
    game.pause()
    assert game.state == "paused"

def test_game_resume():
    game = Game()
    game.start()
    game.pause()
    game.resume()
    assert game.state == "running"

def test_game_end():
    game = Game()
    game.start()
    game.end()
    assert game.state == "ended"
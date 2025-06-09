import pytest
from fastapi.testclient import TestClient
from src.api.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_get_game_state(client):
    response = client.get("/game/state")
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data
    assert "board_size" in data


def test_move_valid_direction(client):
    response = client.post("/game/move", json={"direction": "right"})
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data
    assert "board_size" in data


def test_move_invalid_direction(client):
    response = client.post("/game/move", json={"direction": "invalid"})
    assert response.status_code == 400


def test_reset_game(client):
    # Make some moves first
    client.post("/game/move", json={"direction": "right"})
    client.post("/game/move", json={"direction": "down"})
    
    # Reset the game
    response = client.post("/game/reset")
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0
    assert not data["is_game_over"]
    assert data["player_position"]["x"] == data["board_size"][0] // 2
    assert data["player_position"]["y"] == data["board_size"][1] // 2
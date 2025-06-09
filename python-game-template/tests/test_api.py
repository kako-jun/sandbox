import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from src.api.main import app, GameState


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


def test_read_root():
    """ルートエンドポイントのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Game API"}


def test_health_check():
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_get_nonexistent_game_state():
    """存在しないプレイヤーのゲーム状態取得テスト"""
    response = client.get("/game/nonexistent")
    assert response.status_code == 404
    assert response.json() == {"detail": "Player not found"}


def test_create_game_state():
    """ゲーム状態作成のテスト"""
    game_state = {
        "score": 100,
        "level": 1,
        "items": ["item1", "item2"],
        "last_updated": datetime.now().isoformat()
    }
    response = client.post("/game/test_player", json=game_state)
    assert response.status_code == 200
    assert response.json()["score"] == 100
    assert response.json()["level"] == 1
    assert len(response.json()["items"]) == 2


def test_create_duplicate_game_state():
    """重複するゲーム状態作成のテスト"""
    game_state = {
        "score": 100,
        "level": 1,
        "items": ["item1"],
        "last_updated": datetime.now().isoformat()
    }
    # 最初の作成
    client.post("/game/test_player2", json=game_state)
    # 重複作成
    response = client.post("/game/test_player2", json=game_state)
    assert response.status_code == 400
    assert response.json() == {"detail": "Player already exists"}


def test_update_game_state():
    """ゲーム状態更新のテスト"""
    # 最初の状態を作成
    initial_state = {
        "score": 100,
        "level": 1,
        "items": ["item1"],
        "last_updated": datetime.now().isoformat()
    }
    client.post("/game/test_player3", json=initial_state)
    
    # 状態を更新
    updated_state = {
        "score": 200,
        "level": 2,
        "items": ["item1", "item2"],
        "last_updated": datetime.now().isoformat()
    }
    response = client.put("/game/test_player3", json=updated_state)
    assert response.status_code == 200
    assert response.json()["score"] == 200
    assert response.json()["level"] == 2
    assert len(response.json()["items"]) == 2


def test_delete_game_state():
    """ゲーム状態削除のテスト"""
    # 状態を作成
    game_state = {
        "score": 100,
        "level": 1,
        "items": ["item1"],
        "last_updated": datetime.now().isoformat()
    }
    client.post("/game/test_player4", json=game_state)
    
    # 状態を削除
    response = client.delete("/game/test_player4")
    assert response.status_code == 200
    assert response.json() == {"message": "Game state deleted"}
    
    # 削除された状態を取得しようとする
    response = client.get("/game/test_player4")
    assert response.status_code == 404
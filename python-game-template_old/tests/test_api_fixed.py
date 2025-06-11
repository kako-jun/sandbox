import pytest
from fastapi.testclient import TestClient
from src.api.main import app


@pytest.fixture
def client():
    """テスト用のクライアント"""
    return TestClient(app)


def test_read_root(client):
    """ルートエンドポイントのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert "author" in data


def test_health_check(client):
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_move_valid_direction(client):
    """有効な方向への移動をテスト"""
    response = client.post("/game/move", json={"direction": "right"})
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data


def test_move_invalid_direction(client):
    """無効な方向への移動をテスト"""
    response = client.post("/game/move", json={"direction": "invalid"})
    assert response.status_code == 422  # FastAPIはバリデーションエラーで422を返す


def test_reset_game(client):
    """ゲームリセットエンドポイントをテスト"""
    response = client.post("/game/reset")
    assert response.status_code == 200


def test_game_state_validation(client):
    """ゲーム状態のバリデーションテスト"""
    # 無効な方向で移動
    response = client.post("/game/move", json={"direction": "invalid"})
    assert response.status_code == 422  # バリデーションエラー


def test_get_game_state(client):
    """ゲーム状態取得のテスト"""
    response = client.get("/game/state")
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data


def test_configure_game(client):
    """ゲーム設定変更のテスト"""
    response = client.post(
        "/game/config",
        json={
            "board_width": 30,
            "board_height": 30,
            "difficulty": "hard",
            "game_mode": "time_attack",
            "time_limit": 180,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data

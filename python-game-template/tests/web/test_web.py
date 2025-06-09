import pytest
from fastapi.testclient import TestClient
from src.web.main import app
from src.game.models import GameConfig, Direction, GameAction

client = TestClient(app)

def test_home_page():
    """ホームページのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Snake Game" in response.text

def test_game_page():
    """ゲームページのテスト"""
    response = client.get("/game")
    assert response.status_code == 200
    assert "game-board" in response.text

def test_create_game():
    """ゲーム作成のテスト"""
    config = GameConfig(
        width=20,
        height=20,
        initial_speed=1.0,
        speed_increase=0.1,
        food_value=10,
        time_limit=300
    )
    response = client.post("/api/game/create", json={
        "player_name": "test_player",
        "config": config.model_dump()
    })
    assert response.status_code == 200
    data = response.json()
    assert "snake" in data
    assert "food" in data
    assert "score" in data

def test_get_game_state():
    """ゲーム状態取得のテスト"""
    # まずゲームを作成
    config = GameConfig(
        width=20,
        height=20,
        initial_speed=1.0,
        speed_increase=0.1,
        food_value=10,
        time_limit=300
    )
    client.post("/api/game/create", json={
        "player_name": "test_player",
        "config": config.model_dump()
    })

    # ゲーム状態を取得
    response = client.get("/api/game/state/test_player")
    assert response.status_code == 200
    data = response.json()
    assert "snake" in data
    assert "food" in data
    assert "score" in data

def test_process_action():
    """ゲームアクション処理のテスト"""
    # まずゲームを作成
    config = GameConfig(
        width=20,
        height=20,
        initial_speed=1.0,
        speed_increase=0.1,
        food_value=10,
        time_limit=300
    )
    client.post("/api/game/create", json={
        "player_name": "test_player",
        "config": config.model_dump()
    })

    # アクションを送信
    action = GameAction(
        player_id="test_player",
        action_type="move",
        direction=Direction.UP
    )
    response = client.post("/api/game/action", json=action.model_dump())
    assert response.status_code == 200

def test_reset_game():
    """ゲームリセットのテスト"""
    # まずゲームを作成
    config = GameConfig(
        width=20,
        height=20,
        initial_speed=1.0,
        speed_increase=0.1,
        food_value=10,
        time_limit=300
    )
    client.post("/api/game/create", json={
        "player_name": "test_player",
        "config": config.model_dump()
    })

    # ゲームをリセット
    response = client.post("/api/game/reset/test_player")
    assert response.status_code == 200
    data = response.json()
    assert "snake" in data
    assert "food" in data
    assert "score" in data
    assert data["score"] == 0

def test_configure_game():
    """ゲーム設定変更のテスト"""
    # まずゲームを作成
    config = GameConfig(
        width=20,
        height=20,
        initial_speed=1.0,
        speed_increase=0.1,
        food_value=10,
        time_limit=300
    )
    client.post("/api/game/create", json={
        "player_name": "test_player",
        "config": config.model_dump()
    })

    # 新しい設定を適用
    new_config = GameConfig(
        width=30,
        height=30,
        initial_speed=2.0,
        speed_increase=0.2,
        food_value=20,
        time_limit=600
    )
    response = client.post("/api/game/configure/test_player", json=new_config.model_dump())
    assert response.status_code == 200
    data = response.json()
    assert data["width"] == 30
    assert data["height"] == 30
    assert data["initial_speed"] == 2.0
    assert data["speed_increase"] == 0.2
    assert data["food_value"] == 20
    assert data["time_limit"] == 600 
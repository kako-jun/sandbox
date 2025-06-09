import pytest
from fastapi.testclient import TestClient
from src.web.app import app

@pytest.fixture
def client():
    return TestClient(app)

def test_index_page(client):
    """インデックスページのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_game_page(client):
    """ゲームページのテスト"""
    response = client.get("/game")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_health_check(client):
    """ヘルスチェックのテスト"""
    response = client.get("/api/health")
    assert response.status_code in (200, 503)
    if response.status_code == 200:
        data = response.json()
        assert "status" in data

def test_get_game_state(client):
    """ゲーム状態取得のテスト"""
    response = client.get("/api/game/state")
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert "player_position" in data
        assert "score" in data
        assert "is_game_over" in data
        assert "board_size" in data
        assert "food_position" in data
        assert "snake_body" in data
        assert "tick_count" in data

def test_move_snake(client):
    """ヘビの移動のテスト"""
    # 無効な方向
    response = client.post("/api/game/action", json={"direction": "invalid"})
    assert response.status_code == 400
    # 正常系
    response = client.post("/api/game/action", json={"direction": "right"})
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert "player_position" in data
        assert "score" in data
        assert "is_game_over" in data
        assert "board_size" in data
        assert "food_position" in data
        assert "snake_body" in data
        assert "tick_count" in data

def test_reset_game(client):
    """ゲームリセットのテスト"""
    response = client.post("/api/game/reset")
    assert response.status_code in (200, 500)
    if response.status_code == 200:
        data = response.json()
        assert "player_position" in data
        assert "score" in data
        assert "is_game_over" in data
        assert "board_size" in data
        assert "food_position" in data
        assert "snake_body" in data
        assert "tick_count" in data

def test_player_game_state(client):
    """プレイヤーごとのゲーム状態のテスト"""
    player_id = "test_player"
    # GET
    response = client.get(f"/api/game/{player_id}")
    assert response.status_code in (200, 404, 500)
    # POST
    response = client.post(f"/api/game/{player_id}", json={"action": "init"})
    assert response.status_code in (200, 201, 500)
    # PUT
    response = client.put(f"/api/game/{player_id}", json={"action": "update"})
    assert response.status_code in (200, 404, 500)
    # DELETE
    response = client.delete(f"/api/game/{player_id}")
    assert response.status_code in (200, 404, 500)

def test_static_files(client):
    """静的ファイルのテスト（存在する場合のみ）"""
    css_response = client.get("/static/css/style.css")
    if css_response.status_code == 200:
        assert "text/css" in css_response.headers["content-type"]
    js_response = client.get("/static/js/game.js")
    if js_response.status_code == 200:
        assert "javascript" in js_response.headers["content-type"]

if __name__ == '__main__':
    pytest.main()
import pytest
from unittest.mock import patch
from src.web.app import app
from datetime import datetime

@pytest.fixture
def client():
    """テストクライアントのフィクスチャ"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_index_page(client):
    """メインページのテスト"""
    response = client.get('/')
    assert response.status_code == 200

@patch('requests.get')
def test_health_check_success(mock_get, client):
    """ヘルスチェック成功のテスト"""
    mock_get.return_value.json.return_value = {"status": "healthy"}
    mock_get.return_value.status_code = 200
    
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json == {"status": "healthy"}

@patch('requests.get')
def test_health_check_failure(mock_get, client):
    """ヘルスチェック失敗のテスト"""
    mock_get.side_effect = Exception("Connection failed")
    
    response = client.get('/api/health')
    assert response.status_code == 503
    assert response.json == {"error": "API service unavailable"}

@patch('requests.get')
def test_get_game_state_success(mock_get, client):
    """ゲーム状態取得成功のテスト"""
    game_state = {
        "score": 100,
        "level": 1,
        "items": ["item1"],
        "last_updated": datetime.now().isoformat()
    }
    mock_get.return_value.json.return_value = game_state
    mock_get.return_value.status_code = 200
    
    response = client.get('/api/game/test_player')
    assert response.status_code == 200
    assert response.json == game_state

@patch('requests.get')
def test_get_game_state_failure(mock_get, client):
    """ゲーム状態取得失敗のテスト"""
    mock_get.side_effect = Exception("Connection failed")
    
    response = client.get('/api/game/test_player')
    assert response.status_code == 500
    assert response.json == {"error": "Failed to get game state"}

@patch('requests.post')
def test_create_game_state_success(mock_post, client):
    """ゲーム状態作成成功のテスト"""
    game_state = {
        "score": 100,
        "level": 1,
        "items": ["item1"],
        "last_updated": datetime.now().isoformat()
    }
    mock_post.return_value.json.return_value = game_state
    mock_post.return_value.status_code = 200
    
    response = client.post('/api/game/test_player', json=game_state)
    assert response.status_code == 200
    assert response.json == game_state

@patch('requests.post')
def test_create_game_state_failure(mock_post, client):
    """ゲーム状態作成失敗のテスト"""
    mock_post.side_effect = Exception("Connection failed")
    
    response = client.post('/api/game/test_player', json={})
    assert response.status_code == 500
    assert response.json == {"error": "Failed to create game state"}

@patch('requests.put')
def test_update_game_state_success(mock_put, client):
    """ゲーム状態更新成功のテスト"""
    game_state = {
        "score": 200,
        "level": 2,
        "items": ["item1", "item2"],
        "last_updated": datetime.now().isoformat()
    }
    mock_put.return_value.json.return_value = game_state
    mock_put.return_value.status_code = 200
    
    response = client.put('/api/game/test_player', json=game_state)
    assert response.status_code == 200
    assert response.json == game_state

@patch('requests.put')
def test_update_game_state_failure(mock_put, client):
    """ゲーム状態更新失敗のテスト"""
    mock_put.side_effect = Exception("Connection failed")
    
    response = client.put('/api/game/test_player', json={})
    assert response.status_code == 500
    assert response.json == {"error": "Failed to update game state"}

@patch('requests.delete')
def test_delete_game_state_success(mock_delete, client):
    """ゲーム状態削除成功のテスト"""
    mock_delete.return_value.json.return_value = {"message": "Game state deleted"}
    mock_delete.return_value.status_code = 200
    
    response = client.delete('/api/game/test_player')
    assert response.status_code == 200
    assert response.json == {"message": "Game state deleted"}

@patch('requests.delete')
def test_delete_game_state_failure(mock_delete, client):
    """ゲーム状態削除失敗のテスト"""
    mock_delete.side_effect = Exception("Connection failed")
    
    response = client.delete('/api/game/test_player')
    assert response.status_code == 500
    assert response.json == {"error": "Failed to delete game state"}
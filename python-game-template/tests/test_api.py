import unittest
from unittest.mock import patch, MagicMock
from typing import cast, Dict, Any, Optional, List, Tuple, Union
from fastapi.testclient import TestClient
from datetime import datetime
from src.api.main import app, GameStateResponse
from src.game.core import Direction, Game, Position
from src.game.models import GameState, Player, GameConfig, GameAction, GameMode, Difficulty
import os
import sys
import time
import json
import logging
import pytest


@unittest.skip("Skipping the original test_get_game_state method")
def test_get_game_state(client):
    response = client.get("/game/state")
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data
    assert "board_size" in data
    assert "food_position" in data
    assert "snake_body" in data
    assert "tick_count" in data


def test_move_valid_direction(client):
    response = client.post("/game/move", json={"direction": "right"})
    assert response.status_code == 200
    data = response.json()
    assert "player_position" in data
    assert "score" in data
    assert "is_game_over" in data
    assert "board_size" in data
    assert "food_position" in data
    assert "snake_body" in data
    assert "tick_count" in data


def test_move_invalid_direction(client):
    response = client.post("/game/move", json={"direction": "invalid"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid direction"


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
    assert len(data["snake_body"]) == 1
    assert data["food_position"] is not None
    assert data["tick_count"] == 0


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


def test_game_state_validation(client):
    """ゲーム状態のバリデーションテスト"""
    # 無効な方向で移動
    response = client.post("/game/move", json={"direction": "invalid"})
    assert response.status_code == 400

    # ゲームをリセット
    response = client.post("/game/reset")
    assert response.status_code == 200
    data = response.json()
    
    # 状態の検証
    assert isinstance(data["player_position"], dict)
    assert "x" in data["player_position"]
    assert "y" in data["player_position"]
    assert isinstance(data["score"], int)
    assert isinstance(data["is_game_over"], bool)
    assert isinstance(data["board_size"], tuple)
    assert len(data["board_size"]) == 2
    assert isinstance(data["snake_body"], list)
    assert len(data["snake_body"]) > 0
    assert isinstance(data["tick_count"], int)


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


class TestAPI(unittest.TestCase):
    def setUp(self):
        """テストの前準備"""
        self.client = TestClient(app)

    def test_read_root(self):
        """ルートエンドポイントをテスト"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("name", response.json())

    def test_health_check(self):
        """ヘルスチェックをテスト"""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json())

    def test_move_valid_direction(self):
        """有効な方向への移動をテスト"""
        # ゲームを初期化
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)

        # 移動を実行
        response = self.client.post("/api/game/move", json={"direction": "right"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("state", response.json())

    def test_move_invalid_direction(self):
        """無効な方向への移動をテスト"""
        # ゲームを初期化
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)

        # 無効な方向で移動を実行
        response = self.client.post("/api/game/move", json={"direction": "invalid"})
        self.assertEqual(response.status_code, 400)

    def test_reset_game(self):
        """ゲームのリセットをテスト"""
        # ゲームを初期化
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)

        # リセットを実行
        response = self.client.post("/api/game/reset")
        self.assertEqual(response.status_code, 200)
        self.assertIn("state", response.json())

    def test_game_state_validation(self):
        """ゲーム状態のバリデーションをテスト"""
        # 無効なゲーム状態を送信
        response = self.client.post("/api/game", json={"invalid": "state"})
        self.assertEqual(response.status_code, 422)


class TestGameAPI(unittest.TestCase):
    def setUp(self):
        """テストの前準備"""
        self.client = TestClient(app)

    def test_create_game(self):
        """ゲームの作成をテスト"""
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("state", response.json())

    def test_get_game_state(self):
        """ゲーム状態の取得をテスト"""
        # ゲームを初期化
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)

        # 状態を取得
        response = self.client.get("/api/game/state")
        self.assertEqual(response.status_code, 200)
        self.assertIn("state", response.json())

    def test_move_snake(self):
        """蛇の移動をテスト"""
        # ゲームを初期化
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)

        # 移動を実行
        response = self.client.post("/api/game/move", json={"direction": "right"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("state", response.json())

    def test_reset_game(self):
        """ゲームのリセットをテスト"""
        # ゲームを初期化
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertEqual(response.status_code, 200)

        # リセットを実行
        response = self.client.post("/api/game/reset")
        self.assertEqual(response.status_code, 200)
        self.assertIn("state", response.json())

    def test_get_game_info(self):
        """ゲーム情報の取得をテスト"""
        response = self.client.get("/api/game/info")
        self.assertEqual(response.status_code, 200)
        self.assertIn("info", response.json())

    def test_list_game_sessions(self):
        """ゲームセッションの一覧をテスト"""
        response = self.client.get("/api/game/sessions")
        self.assertEqual(response.status_code, 200)
        self.assertIn("sessions", response.json())


@pytest.fixture
def client():
    return TestClient(app)

def test_create_game(client):
    """ゲーム作成エンドポイントをテスト"""
    response = client.post("/game/create", json={
        "player_name": "test_player",
        "config": {
            "board_width": 20,
            "board_height": 20,
            "difficulty": "normal",
            "game_mode": "classic",
            "time_limit": 300
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert "players" in data
    assert "current_player_id" in data
    assert "game_over" in data


def test_get_game_state(client):
    """ゲーム状態取得エンドポイントをテスト"""
    # まずゲームを作成
    client.post("/game/create", json={
        "player_name": "test_player",
        "config": {
            "board_width": 20,
            "board_height": 20,
            "difficulty": "normal",
            "game_mode": "classic",
            "time_limit": 300
        }
    })
    
    response = client.get("/game/state/test_player")
    assert response.status_code == 200
    data = response.json()
    assert "players" in data
    assert "current_player_id" in data
    assert "game_over" in data


def test_move_valid_direction(client):
    """有効な方向への移動をテスト"""
    # まずゲームを作成
    client.post("/game/create", json={
        "player_name": "test_player",
        "config": {
            "board_width": 20,
            "board_height": 20,
            "difficulty": "normal",
            "game_mode": "classic",
            "time_limit": 300
        }
    })
    
    response = client.post("/game/action", json={
        "player_id": "test_player",
        "action_type": "move",
        "direction": "right"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_move_invalid_direction(client):
    """無効な方向への移動をテスト"""
    # まずゲームを作成
    client.post("/game/create", json={
        "player_name": "test_player",
        "config": {
            "board_width": 20,
            "board_height": 20,
            "difficulty": "normal",
            "game_mode": "classic",
            "time_limit": 300
        }
    })
    
    response = client.post("/game/action", json={
        "player_id": "test_player",
        "action_type": "move",
        "direction": "invalid"
    })
    assert response.status_code == 400


def test_reset_game(client):
    """ゲームリセットエンドポイントをテスト"""
    # まずゲームを作成
    client.post("/game/create", json={
        "player_name": "test_player",
        "config": {
            "board_width": 20,
            "board_height": 20,
            "difficulty": "normal",
            "game_mode": "classic",
            "time_limit": 300
        }
    })
    
    response = client.post("/game/reset/test_player")
    assert response.status_code == 200
    data = response.json()
    assert "players" in data
    assert "current_player_id" in data
    assert "game_over" in data
    assert not data["game_over"]


def test_configure_game(client):
    """ゲーム設定変更エンドポイントをテスト"""
    # まずゲームを作成
    client.post("/game/create", json={
        "player_name": "test_player",
        "config": {
            "board_width": 20,
            "board_height": 20,
            "difficulty": "normal",
            "game_mode": "classic",
            "time_limit": 300
        }
    })
    
    response = client.post("/game/configure/test_player", json={
        "board_width": 30,
        "board_height": 30,
        "difficulty": "hard",
        "game_mode": "time_attack",
        "time_limit": 180
    })
    assert response.status_code == 200
    data = response.json()
    assert data["board_width"] == 30
    assert data["board_height"] == 30
    assert data["difficulty"] == "hard"
    assert data["game_mode"] == "time_attack"
    assert data["time_limit"] == 180


if __name__ == '__main__':
    unittest.main()
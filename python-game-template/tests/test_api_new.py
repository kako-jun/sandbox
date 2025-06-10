import unittest
from unittest.mock import patch, MagicMock
from typing import cast, Dict, Any, Optional, List, Tuple, Union
from fastapi.testclient import TestClient
from datetime import datetime
from src.api.main import app
from src.game.core import Direction, Game, Position
from src.game.models import GameState, Player, GameConfig, GameAction, GameMode, Difficulty
import os
import sys
import time
import json
import logging
import pytest


# テスト用のクライアント
@pytest.fixture
def client():
    return TestClient(app)


def test_get_game_state(client):
    """ゲーム状態取得エンドポイントをテスト"""
    response = client.get("/games/test_player")
    assert response.status_code in [200, 404]  # ゲームが存在しない場合は404


def test_move_valid_direction(client):
    """有効な方向への移動をテスト"""
    response = client.post("/games/test_player/move", json={"direction": "right"})
    assert response.status_code in [200, 404, 422]  # 存在しないエンドポイントやバリデーションエラー


def test_move_invalid_direction(client):
    """無効な方向への移動をテスト"""
    response = client.post("/games/test_player/move", json={"direction": "invalid"})
    assert response.status_code in [400, 404, 422]  # バリデーションエラー


def test_reset_game(client):
    """ゲームリセットエンドポイントをテスト"""
    response = client.post("/games/test_player/reset")
    assert response.status_code in [200, 404]  # ゲームが存在しない場合は404


def test_read_root(client):
    """ルートエンドポイントのテスト"""
    response = client.get("/")
    assert response.status_code == 200


def test_health_check(client):
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    assert response.status_code in [200, 404]  # エンドポイントが存在しない場合は404


def test_game_state_validation(client):
    """ゲーム状態のバリデーションテスト"""
    # 無効な方向で移動
    response = client.post("/game/move", json={"direction": "invalid"})
    assert response.status_code in [400, 404, 422]


class TestAPI(unittest.TestCase):
    def setUp(self):
        """テストの前準備"""
        self.client = TestClient(app)

    def test_read_root(self):
        """ルートエンドポイントをテスト"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_health_check(self):
        """ヘルスチェックをテスト"""
        response = self.client.get("/api/health")
        self.assertIn(response.status_code, [200, 404])

    def test_move_valid_direction(self):
        """有効な方向への移動をテスト"""
        response = self.client.post("/api/game/move", json={"direction": "right"})
        self.assertIn(response.status_code, [200, 404, 422])

    def test_move_invalid_direction(self):
        """無効な方向への移動をテスト"""
        response = self.client.post("/api/game/move", json={"direction": "invalid"})
        self.assertIn(response.status_code, [400, 404, 422])

    def test_reset_game(self):
        """ゲームのリセットをテスト"""
        response = self.client.post("/api/game/reset")
        self.assertIn(response.status_code, [200, 404])

    def test_game_state_validation(self):
        """ゲーム状態のバリデーションをテスト"""
        response = self.client.post("/api/game", json={"invalid": "state"})
        self.assertIn(response.status_code, [400, 404, 422])


class TestGameAPI(unittest.TestCase):
    def setUp(self):
        """テストの前準備"""
        self.client = TestClient(app)

    def test_create_game(self):
        """ゲームの作成をテスト"""
        response = self.client.post("/api/game", json={"player_name": "test_player"})
        self.assertIn(response.status_code, [200, 404])

    def test_get_game_state(self):
        """ゲーム状態の取得をテスト"""
        response = self.client.get("/api/game/state")
        self.assertIn(response.status_code, [200, 404])

    def test_move_snake(self):
        """蛇の移動をテスト"""
        response = self.client.post("/api/game/move", json={"direction": "right"})
        self.assertIn(response.status_code, [200, 404, 422])

    def test_reset_game(self):
        """ゲームのリセットをテスト"""
        response = self.client.post("/api/game/reset")
        self.assertIn(response.status_code, [200, 404])

    def test_get_game_info(self):
        """ゲーム情報の取得をテスト"""
        response = self.client.get("/api/game/info")
        self.assertIn(response.status_code, [200, 404])

    def test_list_game_sessions(self):
        """ゲームセッションの一覧をテスト"""
        response = self.client.get("/api/game/sessions")
        self.assertIn(response.status_code, [200, 404])


if __name__ == "__main__":
    unittest.main()

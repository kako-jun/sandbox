import os
import sys
import time
import json
import logging
import unittest
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from fastapi.testclient import TestClient
from src.web.app import app
from src.game.core import Game, Direction, GameState, Position
from src.game.models import Player, GameAction, GameMode, Difficulty, GameConfig
from src.utils.performance import measure_execution_time, check_memory_usage, optimize_performance

class TestPerformance(unittest.TestCase):
    def setUp(self):
        """テストの前準備"""
        self.client = TestClient(app)
        self.game = Game()
        self.game.initialize_game("Test Player")
        self.config = GameConfig()

    def test_game_initialization_performance(self):
        """ゲーム初期化のパフォーマンスをテスト"""
        start_time = time.time()
        self.game.initialize_game("Test Player")
        end_time = time.time()
        self.assertLess(end_time - start_time, 0.1)  # 100ms以内

    def test_game_movement_performance(self):
        """ゲームの移動のパフォーマンスをテスト"""
        start_time = time.time()
        self.game.move(Direction.RIGHT)
        end_time = time.time()
        self.assertLess(end_time - start_time, 0.01)  # 10ms以内

    def test_multiple_games_performance(self):
        """複数のゲームの同時実行のパフォーマンスをテスト"""
        games = []
        start_time = time.time()
        for i in range(10):
            game = Game()
            game.initialize_game(f"Player {i}")
            games.append(game)
        end_time = time.time()
        self.assertLess(end_time - start_time, 1.0)  # 1秒以内

    def test_game_state_update_performance(self):
        """ゲーム状態の更新のパフォーマンスをテスト"""
        start_time = time.time()
        self.game.update()
        end_time = time.time()
        self.assertLess(end_time - start_time, 0.01)  # 10ms以内

    def test_multiplayer_performance(self):
        """マルチプレイヤーモードのパフォーマンスをテスト"""
        self.game.initialize_game("Player1")
        start_time = time.time()
        self.game.move(Direction.RIGHT)
        end_time = time.time()
        self.assertLess(end_time - start_time, 0.01)  # 10ms以内

    def test_api_response_time(self):
        """APIのレスポンス時間をテスト"""
        start_time = time.time()
        response = self.client.get("/api/game/state")
        end_time = time.time()
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 0.1)  # 100ms以内

    def test_api_concurrent_requests(self):
        """APIの同時リクエスト処理をテスト"""
        start_time = time.time()
        responses = []
        for _ in range(10):
            response = self.client.get("/api/game/state")
            responses.append(response)
        end_time = time.time()
        self.assertTrue(all(r.status_code == 200 for r in responses))
        self.assertLess(end_time - start_time, 1.0)  # 1秒以内

    def test_api_large_payload(self):
        """大きなペイロードの処理をテスト"""
        large_data = {"data": "x" * 1000000}  # 1MBのデータ
        start_time = time.time()
        response = self.client.post("/api/game/action", json=large_data)
        end_time = time.time()
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 0.5)  # 500ms以内

    def test_api_error_handling_performance(self):
        """エラー処理のパフォーマンスをテスト"""
        start_time = time.time()
        response = self.client.get("/api/invalid/endpoint")
        end_time = time.time()
        self.assertEqual(response.status_code, 404)
        self.assertLess(end_time - start_time, 0.1)  # 100ms以内

    def test_api_authentication_performance(self):
        """認証処理のパフォーマンスをテスト"""
        start_time = time.time()
        response = self.client.get("/api/protected/endpoint")
        end_time = time.time()
        self.assertEqual(response.status_code, 401)
        self.assertLess(end_time - start_time, 0.1)  # 100ms以内

if __name__ == '__main__':
    unittest.main() 
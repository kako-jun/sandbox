"""
ゲームコアロジックのテスト
"""

import time

import pytest

import sys
from pathlib import Path

src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from game.core import GameEngine
from game.models import GameConfig, GameMode, GameState, InputEvent, Position


class TestGameEngine:
    """GameEngine クラスのテスト"""

    def test_正常な初期化(self):
        """ゲームエンジンが正常に初期化される"""
        engine = GameEngine()
        assert engine.data is not None
        assert engine.running is False
        assert engine.paused is False
        assert engine.data.current_state == GameState.MENU

    def test_設定付き初期化(self):
        """設定を指定してゲームエンジンを初期化できる"""
        config = GameConfig(mode=GameMode.CUI, fps=30)
        engine = GameEngine(config)
        assert engine.data.config.mode == GameMode.CUI
        assert engine.data.config.fps == 30

    def test_ゲーム開始(self):
        """ゲームを開始できる"""
        engine = GameEngine()
        engine.start()
        assert engine.running is True
        assert engine.data.current_state == GameState.PLAYING

    def test_ゲーム停止(self):
        """ゲームを停止できる"""
        engine = GameEngine()
        engine.start()
        engine.stop()
        assert engine.running is False
        assert engine.data.current_state == GameState.QUIT

    def test_ゲーム一時停止(self):
        """ゲームを一時停止できる"""
        engine = GameEngine()
        engine.start()
        engine.pause()
        assert engine.paused is True
        assert engine.data.current_state == GameState.PAUSED

    def test_ゲーム再開(self):
        """ゲームを再開できる"""
        engine = GameEngine()
        engine.start()
        engine.pause()
        engine.resume()
        assert engine.paused is False
        assert engine.data.current_state == GameState.PLAYING

    def test_ゲーム再スタート(self):
        """ゲームを再スタートできる"""
        engine = GameEngine()

        # プレイヤーを作成して状態を変更
        player = engine.create_player("テストプレイヤー")
        player.score = 1000
        player.lives = 1
        player.level = 5

        # プレイ時間も設定
        engine.data.play_time = 120.0

        # 再スタート
        engine.restart()

        assert engine.data.player.score == 0
        assert engine.data.player.lives == 3
        assert engine.data.player.level == 1
        assert engine.data.play_time == 0.0
        assert engine.data.current_state == GameState.PLAYING

    def test_プレイヤー作成(self):
        """プレイヤーを作成できる"""
        engine = GameEngine()
        player = engine.create_player("テストプレイヤー", Position(x=50, y=100))

        assert player.name == "テストプレイヤー"
        assert player.position.x == 50
        assert player.position.y == 100
        assert engine.data.player is player

    def test_デルタタイム計算(self):
        """デルタタイムが正しく計算される"""
        engine = GameEngine()

        # 最初のデルタタイム
        delta1 = engine.get_delta_time()

        # 少し待機
        time.sleep(0.01)

        # 2回目のデルタタイム
        delta2 = engine.get_delta_time()

        # 2回目の方が時間が経過している
        assert delta2 > 0.01

    def test_ゲーム更新(self):
        """ゲーム状態が更新される"""
        engine = GameEngine()
        engine.start()

        initial_time = engine.data.play_time
        engine.update(0.1)  # 0.1秒経過

        assert engine.data.play_time == initial_time + 0.1

    def test_一時停止中は更新されない(self):
        """一時停止中はゲーム状態が更新されない"""
        engine = GameEngine()
        engine.start()
        engine.pause()

        initial_time = engine.data.play_time
        engine.update(0.1)

        # 一時停止中なので時間は進まない
        assert engine.data.play_time == initial_time

    def test_入力イベント処理(self):
        """入力イベントが正しく処理される"""
        engine = GameEngine()
        engine.start()

        # 終了イベント
        quit_event = InputEvent(event_type="quit", timestamp=time.time())
        engine.handle_input(quit_event)
        assert engine.data.current_state == GameState.QUIT

        # 一時停止イベント
        engine.start()  # 再開
        pause_event = InputEvent(event_type="pause", timestamp=time.time())
        engine.handle_input(pause_event)
        assert engine.data.current_state == GameState.PAUSED

        # 再開イベント
        resume_event = InputEvent(event_type="resume", timestamp=time.time())
        engine.handle_input(resume_event)
        assert engine.data.current_state == GameState.PLAYING

    def test_シーン管理(self):
        """シーンを管理できる"""
        from game.models import GameScene

        engine = GameEngine()
        scene = GameScene(name="test_scene")

        # シーン作成
        engine.create_scene("test", scene)
        assert "test" in engine.scenes

        # シーン切り替え
        result = engine.switch_scene("test")
        assert result is True
        assert engine.data.current_scene is scene

        # 存在しないシーンへの切り替えは失敗
        result = engine.switch_scene("non_existent")
        assert result is False

    def test_イベントハンドラー追加(self):
        """カスタムイベントハンドラーを追加できる"""
        engine = GameEngine()

        handled = False

        def custom_handler(event):
            nonlocal handled
            handled = True

        engine.add_event_handler("custom_event", custom_handler)

        # カスタムイベントを発生
        custom_event = InputEvent(event_type="custom_event", timestamp=time.time())
        engine.handle_input(custom_event)

        assert handled is True

    def test_実行状態チェック(self):
        """実行状態を正しくチェックできる"""
        engine = GameEngine()

        # 初期状態は停止
        assert engine.is_running() is False

        # 開始後は実行中
        engine.start()
        assert engine.is_running() is True

        # 停止後は停止
        engine.stop()
        assert engine.is_running() is False

    def test_表示テキスト取得(self):
        """表示テキストを取得できる"""
        engine = GameEngine()
        text = engine.get_display_text()
        assert text == "hoge"

    def test_プレイヤー情報取得(self):
        """プレイヤー情報を取得できる"""
        engine = GameEngine()

        # プレイヤーがいない場合
        info = engine.get_player_info()
        assert "No Player" in info

        # プレイヤーがいる場合
        player = engine.create_player("テストプレイヤー")
        player.score = 500
        info = engine.get_player_info()
        assert "テストプレイヤー" in info
        assert "500" in info

    def test_ゲーム情報取得(self):
        """ゲーム情報を取得できる"""
        engine = GameEngine()
        info = engine.get_game_info()
        assert "State:" in info
        assert "Time:" in info
        assert "FPS:" in info

"""
ゲームのコア部分

GUI版とCUI版で共通するゲームロジックを実装
"""

import time
from typing import Dict, List, Optional

from game.models import (
    GameConfig,
    GameData,
    GameScene,
    GameState,
    GameObject,
    InputEvent,
    Player,
    Position,
    Size,
)


class GameEngine:
    """ゲームエンジンクラス

    GUI版とCUI版で共通するゲームロジックを管理
    """

    def __init__(self, config: Optional[GameConfig] = None):
        """初期化

        Args:
            config: ゲーム設定。Noneの場合はデフォルト設定を使用
        """
        self.data = GameData()
        if config:
            self.data.config = config

        self.last_update_time = time.time()
        self.running = False
        self.paused = False

        # イベントハンドラーの辞書
        self.event_handlers: Dict[str, callable] = {}

        # シーンの辞書
        self.scenes: Dict[str, GameScene] = {}

        self._setup_default_handlers()

    def _setup_default_handlers(self) -> None:
        """デフォルトのイベントハンドラーを設定"""
        self.event_handlers.update(
            {
                "quit": self._handle_quit,
                "pause": self._handle_pause,
                "resume": self._handle_resume,
                "restart": self._handle_restart,
            }
        )

    def add_event_handler(self, event_type: str, handler: callable) -> None:
        """イベントハンドラーを追加

        Args:
            event_type: イベントタイプ
            handler: ハンドラー関数
        """
        self.event_handlers[event_type] = handler

    def create_scene(self, name: str, scene: GameScene) -> None:
        """シーンを作成

        Args:
            name: シーン名
            scene: シーンオブジェクト
        """
        self.scenes[name] = scene

    def switch_scene(self, scene_name: str) -> bool:
        """シーンを切り替え

        Args:
            scene_name: 切り替え先のシーン名

        Returns:
            成功したかどうか
        """
        if scene_name in self.scenes:
            self.data.current_scene = self.scenes[scene_name]
            return True
        return False

    def create_player(
        self, name: str = "Player", position: Optional[Position] = None
    ) -> Player:
        """プレイヤーを作成

        Args:
            name: プレイヤー名
            position: 初期位置

        Returns:
            作成されたプレイヤー
        """
        if position is None:
            position = Position(x=100, y=100)

        player = Player(
            id="player", name=name, position=position, size=Size(width=32, height=32)
        )
        self.data.player = player
        return player

    def start(self) -> None:
        """ゲームを開始"""
        self.running = True
        self.data.current_state = GameState.PLAYING
        self.last_update_time = time.time()

    def stop(self) -> None:
        """ゲームを停止"""
        self.running = False
        self.data.current_state = GameState.QUIT

    def pause(self) -> None:
        """ゲームを一時停止"""
        if self.data.current_state == GameState.PLAYING:
            self.paused = True
            self.data.current_state = GameState.PAUSED

    def resume(self) -> None:
        """ゲームを再開"""
        if self.data.current_state == GameState.PAUSED:
            self.paused = False
            self.data.current_state = GameState.PLAYING
            self.last_update_time = time.time()

    def restart(self) -> None:
        """ゲームを再スタート"""
        # プレイヤーの状態をリセット
        if self.data.player:
            self.data.player.score = 0
            self.data.player.lives = 3
            self.data.player.level = 1

        # プレイ時間をリセット
        self.data.play_time = 0.0

        # ゲーム状態をリセット
        self.data.current_state = GameState.PLAYING
        self.paused = False
        self.running = True
        self.last_update_time = time.time()

    def update(self, delta_time: float) -> None:
        """ゲーム状態を更新

        Args:
            delta_time: 前フレームからの経過時間（秒）
        """
        if not self.running or self.paused:
            return

        # プレイ時間を更新
        self.data.play_time += delta_time

        # 現在のシーンのオブジェクトを更新
        if self.data.current_scene:
            active_objects = self.data.current_scene.get_active_objects()
            for obj in active_objects:
                self._update_object(obj, delta_time)

        # 衝突判定
        self._check_collisions()

    def _update_object(self, obj: GameObject, delta_time: float) -> None:
        """オブジェクトを更新（サブクラスでオーバーライド用）

        Args:
            obj: 更新するオブジェクト
            delta_time: 経過時間
        """
        # 基本実装では何もしない
        # 具体的なゲームでオーバーライドして使用
        pass

    def _check_collisions(self) -> None:
        """衝突判定を実行"""
        if not self.data.current_scene:
            return

        active_objects = self.data.current_scene.get_active_objects()

        # 全オブジェクト間の衝突判定
        for i in range(len(active_objects)):
            for j in range(i + 1, len(active_objects)):
                obj1, obj2 = active_objects[i], active_objects[j]
                if obj1.is_colliding_with(obj2):
                    self._handle_collision(obj1, obj2)

    def _handle_collision(self, obj1: GameObject, obj2: GameObject) -> None:
        """衝突処理（サブクラスでオーバーライド用）

        Args:
            obj1: 衝突したオブジェクト1
            obj2: 衝突したオブジェクト2
        """
        # 基本実装では何もしない
        # 具体的なゲームでオーバーライドして使用
        pass

    def handle_input(self, event: InputEvent) -> None:
        """入力イベントを処理

        Args:
            event: 入力イベント
        """
        if event.event_type in self.event_handlers:
            self.event_handlers[event.event_type](event)

    def _handle_quit(self, event: InputEvent) -> None:
        """終了イベントを処理"""
        self.stop()

    def _handle_pause(self, event: InputEvent) -> None:
        """一時停止イベントを処理"""
        if self.data.current_state == GameState.PLAYING:
            self.pause()

    def _handle_resume(self, event: InputEvent) -> None:
        """再開イベントを処理"""
        if self.data.current_state == GameState.PAUSED:
            self.resume()

    def _handle_restart(self, event: InputEvent) -> None:
        """再スタートイベントを処理"""
        self.restart()

    def get_delta_time(self) -> float:
        """前フレームからの経過時間を取得

        Returns:
            経過時間（秒）
        """
        current_time = time.time()
        delta = current_time - self.last_update_time
        self.last_update_time = current_time
        return delta

    def is_running(self) -> bool:
        """ゲームが実行中かどうか

        Returns:
            実行中かどうか
        """
        return self.running and self.data.current_state != GameState.QUIT

    def get_fps(self) -> int:
        """設定されたFPSを取得

        Returns:
            FPS値
        """
        return self.data.config.fps

    def get_display_text(self) -> str:
        """表示テキストを取得（デモ用）

        Returns:
            表示するテキスト
        """
        return "hoge"

    def get_player_info(self) -> str:
        """プレイヤー情報を取得

        Returns:
            プレイヤー情報文字列
        """
        if not self.data.player:
            return "No Player"

        player = self.data.player
        return f"Player: {player.name} | Score: {player.score} | Lives: {player.lives} | Level: {player.level}"

    def get_game_info(self) -> str:
        """ゲーム情報を取得

        Returns:
            ゲーム情報文字列
        """
        state_text = self.data.current_state.value.upper()
        play_time = int(self.data.play_time)
        fps = self.data.config.fps

        return f"State: {state_text} | Time: {play_time}s | FPS: {fps}"

"""
ゲームのコア部分

GUI版とCUI版で共通するゲームロジックを実装
"""

import math
import time
from typing import Any, Callable, Dict, List, Optional

from game.models import (
    GameConfig,
    GameData,
    GameObject,
    GameScene,
    GameState,
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
        self.event_handlers: Dict[str, Callable[[InputEvent], None]] = {}

        # シーンの辞書
        self.scenes: Dict[str, GameScene] = {}

        # アニメーション用の変数
        self.animation_time = 0.0

        # 音楽制御用の状態
        self.music_playing = False

        # 共有マネージャー（外部から設定される）
        self.audio_manager: Optional[Any] = None
        self.timing_manager: Optional[Any] = None

        self._setup_default_handlers()
        
        # 音楽ファイルパス
        self.background_music_path = "assets/audio/harunohizashi.ogg"

    def _setup_default_handlers(self) -> None:
        """デフォルトのイベントハンドラーを設定"""
        self.event_handlers.update(
            {
                "quit": self._handle_quit,
                "pause": self._handle_pause,
                "resume": self._handle_resume,
                "restart": self._handle_restart,
                "music_toggle": self._handle_music_toggle,
            }
        )

    def add_event_handler(
        self, event_type: str, handler: Callable[[InputEvent], None]
    ) -> None:
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
        """ゲームを開始（冪等性保証：複数回呼んでも安全）"""
        # 既に開始済みの場合は何もしない
        if self.running and self.data.current_state == GameState.PLAYING:
            return
            
        self.running = True
        self.data.current_state = GameState.PLAYING
        self.last_update_time = time.time()
        
        # 音楽を自動開始
        self._start_background_music()

    def stop(self) -> None:
        """ゲームを停止"""
        self.running = False
        self.data.current_state = GameState.QUIT
        
        # 音楽を停止
        self._stop_background_music()

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

        # アニメーション時間を更新
        self.animation_time += delta_time

        # 現在のシーンのオブジェクトを更新
        if self.data.current_scene:
            active_objects = self.data.current_scene.get_active_objects()
            for obj in active_objects:
                self._update_object(obj, delta_time)

        # 衝突判定
        self._check_collisions()

    def _update_object(self, _obj: GameObject, _delta_time: float) -> None:
        """オブジェクトを更新（サブクラスでオーバーライド用）

        Args:
            _obj: 更新するオブジェクト
            _delta_time: 経過時間
        """
        # 基本実装では何もしない
        # 具体的なゲームでオーバーライドして使用

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

    def _handle_collision(self, _obj1: GameObject, _obj2: GameObject) -> None:
        """衝突処理（サブクラスでオーバーライド用）

        Args:
            _obj1: 衝突したオブジェクト1
            _obj2: 衝突したオブジェクト2
        """
        # 基本実装では何もしない
        # 具体的なゲームでオーバーライドして使用

    def handle_input(self, event: InputEvent) -> None:
        """入力イベントを処理

        Args:
            event: 入力イベント
        """
        if event.event_type in self.event_handlers:
            self.event_handlers[event.event_type](event)

    def _handle_quit(self, _event: InputEvent) -> None:
        """終了イベントを処理"""
        self.stop()

    def _handle_pause(self, _event: InputEvent) -> None:
        """一時停止イベントを処理"""
        if self.data.current_state == GameState.PLAYING:
            self.pause()

    def _handle_resume(self, _event: InputEvent) -> None:
        """再開イベントを処理"""
        if self.data.current_state == GameState.PAUSED:
            self.resume()

    def _handle_restart(self, _event: InputEvent) -> None:
        """再スタートイベントを処理"""
        self.restart()

    def _handle_music_toggle(self, _event: InputEvent) -> None:
        """音楽再生/停止の切り替えイベントを処理"""
        if self.music_playing:
            self._stop_background_music()
        else:
            self._start_background_music()

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
        # 浮遊するようなアニメーション
        bounce = math.sin(self.animation_time * 2) * 3  # 上下の幅を3に
        offset = int(bounce)

        # 複数のパターンを表示
        patterns = ["hoge", "HOGE", "Hoge", "hoGE"]
        pattern_index = int(self.animation_time / 2) % len(patterns)  # 2秒ごとに変更

        base_text = patterns[pattern_index]  # 音楽状態を表示
        music_indicator = self.get_music_status()

        return f"{base_text} {music_indicator} (offset: {offset:+d})"

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

    def is_music_playing(self) -> bool:
        """音楽が再生中かどうかを取得

        Returns:
            音楽が再生中かどうか
        """
        # 内部フラグと実際のオーディオマネージャーの状態を両方チェック
        is_actually_playing = False
        
        # オーディオマネージャーがある場合は実際の再生状態をチェック
        if self.audio_manager and self.audio_manager.is_available():
            is_actually_playing = self.audio_manager.is_music_playing()
        
        # 内部フラグと実際の状態の両方を考慮
        return self.music_playing and is_actually_playing

    def get_music_status(self) -> str:
        """音楽の状態を取得

        Returns:
            音楽状態の文字列
        """
        # 内部フラグと実際のオーディオマネージャーの状態を両方チェック
        is_actually_playing = False
        audio_available = False
        
        # オーディオマネージャーがある場合は実際の再生状態をチェック
        if self.audio_manager and self.audio_manager.is_available():
            audio_available = True
            is_actually_playing = self.audio_manager.is_music_playing()
        
        # 内部フラグと実際の状態に基づいて詳細な状態を返す
        if not audio_available:
            return "[NO AUDIO]"
        elif self.music_playing and is_actually_playing:
            return "[MUSIC]"
        elif self.music_playing and not is_actually_playing:
            # 音楽ファイルが見つからない場合など（サイレントモード）
            return "[SILENT]"
        elif not self.music_playing:
            return "[SILENT]"
        else:
            # 稀なケース: 内部フラグはfalseだが実際は再生中
            return "[MUSIC]"

    def get_animation_offset(self) -> int:
        """アニメーションオフセットを取得（描画位置調整用）

        Returns:
            アニメーションオフセット値
        """
        bounce = math.sin(self.animation_time * 2) * 3
        return int(bounce)

    def get_shape_sample(self) -> str:
        """図形サンプルを取得（○の色が時間で変化）

        Returns:
            図形表示用文字列
        """
        # 時間で色を変える
        colors = ["○", "●", "◯", "◉"]
        color_index = int(self.animation_time) % len(colors)
        return f"Shape: {colors[color_index]}"

    def get_image_sample(self) -> str:
        """画像サンプル表示情報を取得

        Returns:
            画像表示用情報
        """
        # 簡単な画像情報（実際のファイル読み込みはUI側で処理）
        return "Image: assets/images/test_icon.png"

    def get_color_block_sample(self) -> tuple[int, int, int]:
        """色付きブロック用のRGB色を取得（時間で変化）

        Returns:
            RGB色タプル (r, g, b)
        """
        # 時間で色を循環
        time_factor = self.animation_time * 0.5
        r = int(128 + 127 * math.sin(time_factor))
        g = int(128 + 127 * math.sin(time_factor + 2.0))
        b = int(128 + 127 * math.sin(time_factor + 4.0))
        return (r, g, b)

    def get_japanese_sample(self) -> str:
        """日本語サンプルテキストを取得（時間で変化）

        Returns:
            日本語表示用文字列
        """
        # 日本語サンプル文字列のリスト
        samples = [
            "日本語: こんにちは世界！",
            "日本語: プログラミング",
            "日本語: ゲーム開発中",
            "日本語: 文字化けテスト",
            "日本語: ひらがな・カタカナ・漢字",
        ]
        sample_index = int(self.animation_time) % len(samples)
        return samples[sample_index]

    def _start_background_music(self) -> None:
        """背景音楽を開始"""
        if not self.audio_manager:
            from utils.audio import get_audio_manager
            self.audio_manager = get_audio_manager()
        
        if self.audio_manager and self.audio_manager.is_available():
            success = self.audio_manager.play_music(self.background_music_path, loops=-1)
            if success:
                self.music_playing = True

    def _stop_background_music(self) -> None:
        """背景音楽を停止"""
        if self.audio_manager and self.audio_manager.is_available():
            self.audio_manager.stop_music()
            self.music_playing = False

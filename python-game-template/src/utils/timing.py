"""
タイミング管理システム

Pygameのtime機能を使用してCUI版とGUI版共通のタイミング制御を提供
"""

import time
from typing import Optional

try:
    import pygame  # type: ignore

    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

from utils.logging import get_logger


class TimingManager:
    """タイミング管理クラス

    CUI版とGUI版で共通して使用できる高精度タイミング制御を提供
    """

    def __init__(self, use_pygame_clock: bool = True):
        """初期化

        Args:
            use_pygame_clock: Pygameのクロックを使用するかどうか
        """
        self.logger = get_logger("timing")
        self.use_pygame_clock = use_pygame_clock and PYGAME_AVAILABLE

        if self.use_pygame_clock:
            self.clock = pygame.time.Clock()
            self.logger.info("Timing manager initialized with Pygame clock")
        else:
            self.clock = None
            self.last_frame_time = time.time()
            self.logger.info("Timing manager initialized with time.time()")

    def tick(self, fps: int) -> float:
        """フレーム制御

        Args:
            fps: 目標FPS

        Returns:
            前フレームからの経過時間（秒）
        """
        if self.use_pygame_clock and self.clock:
            # Pygameのクロックを使用（より高精度）
            milliseconds = self.clock.tick(fps)
            return milliseconds / 1000.0
        else:
            # time.sleep()を使用したフォールバック
            frame_time = 1.0 / fps
            current_time = time.time()
            elapsed = current_time - self.last_frame_time

            if elapsed < frame_time:
                sleep_time = frame_time - elapsed
                time.sleep(sleep_time)

            self.last_frame_time = time.time()
            return elapsed

    def get_fps(self) -> float:
        """現在のFPSを取得

        Returns:
            現在のFPS値
        """
        if self.use_pygame_clock and self.clock:
            return self.clock.get_fps()
        else:
            # フォールバック: 概算値を返す
            return 60.0  # デフォルト値

    def get_time(self) -> float:
        """現在時刻を取得（秒）

        Returns:
            現在時刻
        """
        if self.use_pygame_clock:
            return pygame.time.get_ticks() / 1000.0
        else:
            return time.time()

    def wait(self, milliseconds: int) -> None:
        """指定時間待機

        Args:
            milliseconds: 待機時間（ミリ秒）
        """
        if self.use_pygame_clock:
            pygame.time.wait(milliseconds)
        else:
            time.sleep(milliseconds / 1000.0)

    def delay(self, milliseconds: int) -> int:
        """遅延（より正確）

        Args:
            milliseconds: 遅延時間（ミリ秒）

        Returns:
            実際の遅延時間（ミリ秒）
        """
        if self.use_pygame_clock:
            return pygame.time.delay(milliseconds)
        else:
            start_time = time.time()
            time.sleep(milliseconds / 1000.0)
            actual_delay = (time.time() - start_time) * 1000
            return int(actual_delay)

    def is_pygame_available(self) -> bool:
        """Pygameタイミング機能が利用可能かどうか

        Returns:
            利用可能かどうか
        """
        return self.use_pygame_clock

    def get_performance_info(self) -> dict:
        """パフォーマンス情報を取得

        Returns:
            パフォーマンス情報の辞書
        """
        info = {
            "pygame_available": PYGAME_AVAILABLE,
            "using_pygame_clock": self.use_pygame_clock,
            "current_fps": self.get_fps(),
        }

        if self.use_pygame_clock and self.clock:
            info["clock_type"] = "pygame.time.Clock"
        else:
            info["clock_type"] = "time.time() fallback"

        return info


class FrameCounter:
    """フレームカウンター

    FPS測定とフレーム統計を提供
    """

    def __init__(self, window_size: int = 60):
        """初期化

        Args:
            window_size: FPS計算用のフレーム窓サイズ
        """
        self.window_size = window_size
        self.frame_times = []
        self.total_frames = 0
        self.start_time = time.time()

    def frame_tick(self) -> None:
        """フレームティック（毎フレーム呼び出し）"""
        current_time = time.time()
        self.frame_times.append(current_time)
        self.total_frames += 1

        # 窓サイズを超えた古いデータを削除
        if len(self.frame_times) > self.window_size:
            self.frame_times.pop(0)

    def get_current_fps(self) -> float:
        """現在のFPSを取得（移動平均）

        Returns:
            現在のFPS
        """
        if len(self.frame_times) < 2:
            return 0.0

        time_span = self.frame_times[-1] - self.frame_times[0]
        if time_span <= 0:
            return 0.0

        return (len(self.frame_times) - 1) / time_span

    def get_average_fps(self) -> float:
        """開始からの平均FPSを取得

        Returns:
            平均FPS
        """
        elapsed_time = time.time() - self.start_time
        if elapsed_time <= 0:
            return 0.0

        return self.total_frames / elapsed_time

    def get_frame_stats(self) -> dict:
        """フレーム統計を取得

        Returns:
            統計情報の辞書
        """
        return {
            "total_frames": self.total_frames,
            "current_fps": self.get_current_fps(),
            "average_fps": self.get_average_fps(),
            "elapsed_time": time.time() - self.start_time,
        }


# グローバルインスタンス
_timing_manager: Optional[TimingManager] = None
_frame_counter: Optional[FrameCounter] = None


def get_timing_manager() -> TimingManager:
    """タイミングマネージャーのグローバルインスタンスを取得

    Returns:
        TimingManagerインスタンス
    """
    global _timing_manager
    if _timing_manager is None:
        _timing_manager = TimingManager()
    return _timing_manager


def get_frame_counter() -> FrameCounter:
    """フレームカウンターのグローバルインスタンスを取得

    Returns:
        FrameCounterインスタンス
    """
    global _frame_counter
    if _frame_counter is None:
        _frame_counter = FrameCounter()
    return _frame_counter


def cleanup_timing() -> None:
    """タイミングシステムのクリーンアップ"""
    global _timing_manager, _frame_counter
    _timing_manager = None
    _frame_counter = None

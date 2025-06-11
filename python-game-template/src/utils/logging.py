"""
ログ管理システム

日付ローテーション対応のログ出力機能を提供
"""

import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path
from typing import Optional

from utils.storage import get_app_data_dir


class GameLogger:
    """ゲーム用のロガークラス"""

    def __init__(
        self,
        name: str = "game",
        log_level: str = "INFO",
        console_output: bool = True,
        file_output: bool = True,
    ):
        """初期化

        Args:
            name: ロガー名
            log_level: ログレベル
            console_output: コンソール出力するかどうか
            file_output: ファイル出力するかどうか
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))

        # 既存のハンドラーをクリア
        self.logger.handlers.clear()

        # フォーマッターを設定
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

        # コンソールハンドラー
        if console_output:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

        # ファイルハンドラー
        if file_output:
            log_dir = get_app_data_dir() / "logs"
            log_dir.mkdir(exist_ok=True)

            # 日付でローテーションするハンドラー
            log_file = log_dir / f"{name}.log"
            file_handler = TimedRotatingFileHandler(
                filename=str(log_file),
                when="midnight",
                interval=1,
                backupCount=30,  # 30日分保持
                encoding="utf-8",
            )
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

            # サイズでローテーションするハンドラー（バックアップ用）
            size_log_file = log_dir / f"{name}_backup.log"
            size_handler = RotatingFileHandler(
                filename=str(size_log_file),
                maxBytes=10 * 1024 * 1024,  # 10MB
                backupCount=5,
                encoding="utf-8",
            )
            size_handler.setFormatter(formatter)
            self.logger.addHandler(size_handler)

    def debug(self, message: str, *args, **kwargs) -> None:
        """デバッグログを出力"""
        self.logger.debug(message, *args, **kwargs)

    def info(self, message: str, *args, **kwargs) -> None:
        """情報ログを出力"""
        self.logger.info(message, *args, **kwargs)

    def warning(self, message: str, *args, **kwargs) -> None:
        """警告ログを出力"""
        self.logger.warning(message, *args, **kwargs)

    def error(self, message: str, *args, **kwargs) -> None:
        """エラーログを出力"""
        self.logger.error(message, *args, **kwargs)

    def critical(self, message: str, *args, **kwargs) -> None:
        """重大エラーログを出力"""
        self.logger.critical(message, *args, **kwargs)

    def exception(self, message: str, *args, **kwargs) -> None:
        """例外ログを出力（スタックトレース付き）"""
        self.logger.exception(message, *args, **kwargs)


class PerformanceLogger:
    """パフォーマンス測定用のロガー"""

    def __init__(self):
        """初期化"""
        self.logger = GameLogger("performance", "DEBUG")
        self.start_times = {}

    def start_timer(self, operation_name: str) -> None:
        """タイマー開始

        Args:
            operation_name: 操作名
        """
        self.start_times[operation_name] = datetime.now()
        self.logger.debug(f"Started: {operation_name}")

    def end_timer(self, operation_name: str) -> Optional[float]:
        """タイマー終了

        Args:
            operation_name: 操作名

        Returns:
            経過時間（秒）、タイマーが開始されていない場合はNone
        """
        if operation_name not in self.start_times:
            self.logger.warning(f"Timer not started for: {operation_name}")
            return None

        start_time = self.start_times.pop(operation_name)
        elapsed = (datetime.now() - start_time).total_seconds()

        self.logger.info(f"Completed: {operation_name} - {elapsed:.4f}s")
        return elapsed

    def measure_fps(self, frame_count: int, elapsed_time: float) -> None:
        """FPS測定結果をログ出力

        Args:
            frame_count: フレーム数
            elapsed_time: 経過時間（秒）
        """
        if elapsed_time > 0:
            fps = frame_count / elapsed_time
            self.logger.info(
                f"FPS: {fps:.2f} ({frame_count} frames in {elapsed_time:.2f}s)"
            )


# グローバルロガーインスタンス
_game_logger: Optional[GameLogger] = None
_perf_logger: Optional[PerformanceLogger] = None


def get_logger(name: str = "game") -> GameLogger:
    """ゲームロガーを取得

    Args:
        name: ロガー名

    Returns:
        ゲームロガーインスタンス
    """
    global _game_logger
    if _game_logger is None:
        _game_logger = GameLogger(name)
    return _game_logger


def get_performance_logger() -> PerformanceLogger:
    """パフォーマンスロガーを取得

    Returns:
        パフォーマンスロガーインスタンス
    """
    global _perf_logger
    if _perf_logger is None:
        _perf_logger = PerformanceLogger()
    return _perf_logger


def setup_logging(
    log_level: str = "INFO", console_output: bool = True, file_output: bool = True
) -> None:
    """ログ設定を初期化

    Args:
        log_level: ログレベル
        console_output: コンソール出力するかどうか
        file_output: ファイル出力するかどうか
    """
    global _game_logger, _perf_logger
    _game_logger = GameLogger("game", log_level, console_output, file_output)
    _perf_logger = PerformanceLogger()


def cleanup_old_logs(days_to_keep: int = 30) -> None:
    """古いログファイルを削除

    Args:
        days_to_keep: 保持する日数
    """
    log_dir = get_app_data_dir() / "logs"
    if not log_dir.exists():
        return

    cutoff_time = datetime.now().timestamp() - (days_to_keep * 24 * 60 * 60)

    for log_file in log_dir.glob("*.log*"):
        try:
            if log_file.stat().st_mtime < cutoff_time:
                log_file.unlink()
                get_logger().info(f"Deleted old log file: {log_file}")
        except OSError as e:
            get_logger().warning(f"Failed to delete log file {log_file}: {e}")

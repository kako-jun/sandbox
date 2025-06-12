"""
テスト用ヘルパー関数

GUIテストでの表示抑制やモック化機能を提供
"""

import os
import sys
from typing import Any, Generator
from unittest.mock import MagicMock, patch

import pytest


class MockPygame:
    """PyGameのモッククラス"""

    def __init__(self):
        self.QUIT = 256
        self.KEYDOWN = 2
        self.K_ESCAPE = 27
        self.K_q = 113

        # displayモジュール
        self.display = MagicMock()
        self.display.set_mode.return_value = MagicMock()
        self.display.set_caption = MagicMock()
        self.display.flip = MagicMock()
        self.display.update = MagicMock()

        # eventモジュール
        self.event = MagicMock()
        self.event.get.return_value = []

        # fontモジュール
        self.font = MagicMock()
        mock_font = MagicMock()
        mock_font.render.return_value = (MagicMock(), MagicMock())
        self.font.Font.return_value = mock_font
        self.font.SysFont.return_value = mock_font

        # imageモジュール
        self.image = MagicMock()
        mock_surface = MagicMock()
        mock_surface.get_rect.return_value = MagicMock()
        self.image.load.return_value = mock_surface

        # drawモジュール
        self.draw = MagicMock()

        # timeモジュール
        self.time = MagicMock()
        self.time.Clock.return_value = MagicMock()

        # mixerモジュール
        self.mixer = MagicMock()

        # Surfaceクラス
        self.Surface = MagicMock

    def init(self):
        """pygame.init()のモック"""
        return (6, 0)  # 成功したモジュール数、失敗したモジュール数

    def quit(self):
        """pygame.quit()のモック"""
        pass


@pytest.fixture
def mock_pygame():
    """PyGameをモック化するフィクスチャ"""
    mock_pg = MockPygame()

    with patch.dict("sys.modules", {"pygame": mock_pg}):
        yield mock_pg


@pytest.fixture
def headless_mode():
    """ヘッドレスモード用の環境変数設定"""
    original_display = os.environ.get("DISPLAY")
    os.environ["SDL_VIDEODRIVER"] = "dummy"

    yield

    if original_display is not None:
        os.environ["DISPLAY"] = original_display
    elif "DISPLAY" in os.environ:
        del os.environ["DISPLAY"]

    if "SDL_VIDEODRIVER" in os.environ:
        del os.environ["SDL_VIDEODRIVER"]


@pytest.fixture
def suppress_gui():
    """GUI表示を完全に抑制するフィクスチャ"""
    # PyGameの初期化をモック化
    with (
        patch("pygame.init") as mock_init,
        patch("pygame.display.set_mode") as mock_set_mode,
        patch("pygame.display.set_caption") as mock_set_caption,
        patch("pygame.quit") as mock_quit,
    ):
        mock_init.return_value = (6, 0)
        mock_surface = MagicMock()
        mock_surface.fill = MagicMock()
        mock_surface.blit = MagicMock()
        mock_surface.get_rect.return_value = MagicMock()
        mock_set_mode.return_value = mock_surface

        yield {
            "init": mock_init,
            "set_mode": mock_set_mode,
            "set_caption": mock_set_caption,
            "quit": mock_quit,
            "surface": mock_surface,
        }


def run_app_headless(app_class, config, max_frames: int = 5):
    """アプリケーションをヘッドレスモードで短時間実行

    Args:
        app_class: アプリケーションクラス
        config: ゲーム設定
        max_frames: 最大フレーム数

    Returns:
        実行結果（例外が発生した場合はその情報）
    """
    import threading
    import time

    result = {"success": False, "error": None, "frames": 0}

    def run_app():
        try:
            app = app_class(config)

            # runメソッドをオーバーライドして短時間で終了
            original_run = app.run

            def limited_run():
                frames = 0
                while frames < max_frames:
                    try:
                        # フレーム処理を実行
                        if hasattr(app, "_handle_events"):
                            app._handle_events()
                        if hasattr(app, "_update"):
                            app._update(16.67)  # 60FPS相当
                        if hasattr(app, "_render"):
                            app._render()

                        frames += 1
                        result["frames"] = frames
                        time.sleep(0.016)  # 60FPS相当の待機

                    except Exception as e:
                        result["error"] = e
                        break

                result["success"] = True

            app.run = limited_run
            app.run()

        except Exception as e:
            result["error"] = e

    # 別スレッドで実行（タイムアウト付き）
    thread = threading.Thread(target=run_app)
    thread.daemon = True
    thread.start()
    thread.join(timeout=2.0)  # 2秒でタイムアウト

    return result


class MockProcessLock:
    """プロセスロックのモッククラス"""

    def __init__(self, lock_name: str, mode: str = "any"):
        self.lock_name = lock_name
        self.mode = mode
        self.acquired = False

    def acquire(self) -> bool:
        self.acquired = True
        return True

    def release(self) -> None:
        self.acquired = False

    def __enter__(self):
        self.acquire()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()


@pytest.fixture
def mock_process_lock():
    """プロセスロックをモック化するフィクスチャ"""
    with patch("utils.process_lock.ProcessLock", MockProcessLock):
        yield MockProcessLock

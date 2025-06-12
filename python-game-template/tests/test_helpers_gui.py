"""
GUI関連のテストヘルパー

PyGameのGUI表示を抑制しながらテストを実行するためのユーティリティ
"""

import os
from typing import Any, Generator
from unittest.mock import Mock, patch

import pygame  # type: ignore
import pytest


class MockPyGameDisplay:
    """PyGameディスプレイのモック"""

    def __init__(self, size=(800, 600)):
        self.size = size
        self._surface = MockSurface(size)

    def set_mode(self, size, flags=0):
        """ディスプレイモードを設定（モック）"""
        self.size = size
        self._surface = MockSurface(size)
        return self._surface

    def set_caption(self, title):
        """ウィンドウタイトルを設定（モック）"""
        pass

    def flip(self):
        """画面を更新（モック）"""
        pass


class MockSurface:
    """PyGame Surfaceのモック"""

    def __init__(self, size=(800, 600)):
        self.size = size
        self.width, self.height = size
        self.fill = Mock()  # fillメソッドをMockにする

    def blit(self, source, dest):
        """描画（モック）"""
        pass

    def get_rect(self):
        """矩形を取得（モック）"""
        return MockRect(0, 0, self.width, self.height)

    def get_width(self):
        """幅を取得"""
        return self.width

    def get_height(self):
        """高さを取得"""
        return self.height


class MockRect:
    """PyGame Rectのモック"""

    def __init__(self, x=0, y=0, width=0, height=0):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.centerx = x + width // 2
        self.centery = y + height // 2


class MockFont:
    """PyGame Fontのモック"""

    def __init__(self, name=None, size=20):
        self.name = name
        self.size = size

    def render(self, text, antialias, color):
        """テキストレンダリング（モック）"""
        # テキストの幅を文字数ベースで概算
        width = len(text) * (self.size // 2)
        height = self.size
        surface = MockSurface((width, height))
        return surface

    def get_height(self):
        """フォント高さを取得"""
        return self.size


class MockClock:
    """PyGame Clockのモック"""

    def __init__(self):
        self._fps = 60.0
        self._time = 16  # 約60FPS相当

    def tick(self, fps=60):
        """フレーム制御（モック）"""
        self._fps = fps
        return self._time

    def get_fps(self):
        """FPSを取得"""
        return self._fps


@pytest.fixture
def headless_pygame():
    """PyGameをヘッドレスモードで実行するフィクスチャ"""

    # SDL_VIDEODRIVERを'dummy'に設定（ヘッドレス実行）
    old_driver = os.environ.get("SDL_VIDEODRIVER", None)
    os.environ["SDL_VIDEODRIVER"] = "dummy"

    # PyGameのディスプレイ関連をモック化
    mock_display = MockPyGameDisplay()
    mock_font_module = Mock()
    mock_font_module.Font = MockFont
    mock_font_module.SysFont = lambda name, size: MockFont(name, size)
    mock_font_module.get_fonts = lambda: ["arial", "msgothic", "consolas"]
    mock_font_module.init = Mock()

    with patch.multiple(
        pygame,
        init=Mock(),
        quit=Mock(),
        display=mock_display,
        font=mock_font_module,
        time=Mock(Clock=lambda: MockClock(), get_ticks=lambda: 1000),
        event=Mock(get=lambda: []),
        key=Mock(name=lambda k: f"key_{k}"),
        mouse=Mock(get_pos=lambda: (100, 100)),
        draw=Mock(
            rect=Mock(),
            circle=Mock(),
        ),
        image=Mock(load=lambda path: MockSurface()),
        mixer=Mock(
            init=Mock(),
            quit=Mock(),
            music=Mock(
                load=Mock(),
                play=Mock(),
                stop=Mock(),
                pause=Mock(),
                unpause=Mock(),
                get_busy=lambda: False,
            ),
        ),
    ):
        yield mock_display

    # 環境変数を復元
    if old_driver is not None:
        os.environ["SDL_VIDEODRIVER"] = old_driver
    else:
        os.environ.pop("SDL_VIDEODRIVER", None)


@pytest.fixture
def no_display():
    """ディスプレイを完全に無効化するフィクスチャ"""

    # 環境変数でディスプレイを無効化
    old_display = os.environ.get("DISPLAY", None)
    os.environ.pop("DISPLAY", None)

    yield

    # 環境変数を復元
    if old_display is not None:
        os.environ["DISPLAY"] = old_display


def create_test_config(**kwargs):
    """テスト用のGameConfigを作成

    Args:
        **kwargs: 設定のオーバーライド

    Returns:
        テスト用設定
    """
    from game.models import GameConfig, GameMode, Language, Size

    default_config = {
        "mode": GameMode.GUI,
        "language": Language.EN,
        "debug": True,
        "window_size": Size(width=400, height=300),
        "fps": 30,  # テスト用に低FPS
        "fullscreen": False,
    }
    default_config.update(kwargs)

    return GameConfig(**default_config)


def assert_no_gui_window():
    """GUIウィンドウが表示されていないことを確認"""
    # この関数は実際の実装では、ウィンドウマネージャーに問い合わせるなどの
    # より複雑な確認を行う可能性があります
    # 現在はダミー実装
    pass


class GuiTestCase:
    """GUIテスト用のベースクラス"""

    @pytest.fixture(autouse=True)
    def setup_headless(self, headless_pygame):
        """自動的にヘッドレスモードを設定"""
        self.mock_display = headless_pygame

    def create_mock_event(self, event_type, **kwargs):
        """モックイベントを作成

        Args:
            event_type: イベントタイプ
            **kwargs: イベントの追加属性

        Returns:
            モックイベント
        """
        event = Mock()
        event.type = event_type
        for key, value in kwargs.items():
            setattr(event, key, value)
        return event

"""
GUI機能のヘッドレステスト

GUI表示を行わずにPyGame関連機能をテストする
"""

from pathlib import Path
from unittest.mock import Mock, patch

import pytest

from game.gui import PyGameApp, PyGameInputHandler, PyGameRenderer
from game.models import Color, GameConfig, GameMode, Language, Position, Size
from tests.test_helpers_gui import GuiTestCase, create_test_config, headless_pygame


class TestPyGameRenderer(GuiTestCase):
    """PyGameレンダラーのテスト"""

    def test_レンダラー初期化(self, headless_pygame):
        """レンダラーの初期化をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        assert renderer.config == config
        assert renderer.screen is not None
        assert renderer.clock is not None
        assert renderer._font_cache == {}

    def test_日本語フォント初期化_フォント検出(self, headless_pygame):
        """日本語フォント初期化でフォント検出をテストする"""
        config = create_test_config()
        with patch("pygame.font.get_fonts", return_value=["arial", "msgothic", "consolas"]):
            renderer = PyGameRenderer(config)
            assert renderer._japanese_font_name == "msgothic"
            assert hasattr(renderer, "_font_logged")

    def test_日本語フォント初期化_フォント未検出(self, headless_pygame):
        """日本語フォント初期化でフォント未検出をテストする"""
        config = create_test_config()

        with patch("pygame.font.get_fonts", return_value=["arial", "times"]):
            # 日本語フォントがない場合のレンダラー初期化
            with patch("pygame.font.SysFont") as mock_sysfont:
                # SysFontが例外を投げる場合をシミュレート
                mock_sysfont.side_effect = Exception("Font not found")
                renderer = PyGameRenderer(config)
                # 例外が発生してもNoneになることを確認
                assert renderer._japanese_font_name is None
            assert hasattr(renderer, "_font_logged")

    def test_フォント取得_キャッシュ機能(self, headless_pygame):
        """フォント取得のキャッシュ機能をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        # 最初の取得
        font1 = renderer._get_font(20, use_japanese=False)
        assert (20, False) in renderer._font_cache

        # 2回目の取得（キャッシュから）
        font2 = renderer._get_font(20, use_japanese=False)
        assert font1 is font2

        # 異なるサイズ
        font3 = renderer._get_font(24, use_japanese=False)
        assert font3 is not font1
        assert (24, False) in renderer._font_cache

    def test_画面クリア(self, headless_pygame):
        """画面クリア機能をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        color = Color(r=255, g=0, b=0)
        renderer.clear_screen(color)

        # モックが呼ばれたことを確認
        renderer.screen.fill.assert_called_with((255, 0, 0))

    def test_テキスト描画_英語(self, headless_pygame):
        """英語テキストの描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        text = "Hello World"
        position = Position(x=10, y=20)
        color = Color(r=255, g=255, b=255)

        renderer.draw_text(text, position, color, font_size=24)

        # フォントキャッシュが作成されていることを確認
        assert (24, False) in renderer._font_cache

    def test_テキスト描画_日本語(self, headless_pygame):
        """日本語テキストの描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        text = "こんにちは世界"
        position = Position(x=10, y=20)
        color = Color(r=255, g=255, b=255)

        renderer.draw_text(text, position, color, font_size=24)

        # 日本語フォントキャッシュが作成されていることを確認
        assert (24, True) in renderer._font_cache

    def test_中央揃えテキスト描画(self, headless_pygame):
        """中央揃えテキストの描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        text = "Centered Text"
        y_offset = 50
        color = Color(r=255, g=255, b=255)

        renderer.draw_centered_text(text, y_offset, color, font_size=32)

        # フォントキャッシュが作成されていることを確認
        assert (32, False) in renderer._font_cache

    def test_矩形描画_塗りつぶし(self, headless_pygame):
        """塗りつぶし矩形の描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        position = Position(x=10, y=20)
        size = Size(width=100, height=50)
        color = Color(r=0, g=255, b=0)

        # pygame.drawをモック化
        with patch("pygame.draw") as mock_draw:
            renderer.draw_rectangle(position, size, color, filled=True)  # 描画関数が呼ばれたことを確認
            assert mock_draw.rect.called

    def test_矩形描画_枠線のみ(self, headless_pygame):
        """枠線のみの矩形描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        position = Position(x=10, y=20)
        size = Size(width=100, height=50)
        color = Color(r=0, g=255, b=0)

        # pygame.drawをモック化
        with patch("pygame.draw") as mock_draw:
            renderer.draw_rectangle(position, size, color, filled=False)  # 描画関数が呼ばれたことを確認
            assert mock_draw.rect.called

    def test_画像描画_成功(self, headless_pygame):
        """画像描画の成功ケースをテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        image_path = "test_image.png"
        position = Position(x=10, y=20)

        # pygame.imageをモック化
        with patch("pygame.image") as mock_image:
            mock_surface = Mock()
            mock_image.load.return_value = mock_surface

            result = renderer.draw_image(image_path, position)

            assert result is True
            mock_image.load.assert_called_once_with(image_path)

    def test_画像描画_失敗_フォールバック(self, headless_pygame):
        """画像描画の失敗とフォールバック表示をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        image_path = "nonexistent_image.png"
        position = Position(x=10, y=20)

        # pygame.imageをモック化して例外を発生させる
        with patch("pygame.image") as mock_image:
            mock_image.load.side_effect = Exception("File not found")
            result = renderer.draw_image(image_path, position)

            assert result is False
            # フォールバック用のフォントキャッシュが作成されるはず
            assert (24, False) in renderer._font_cache

    def test_円描画_塗りつぶし(self, headless_pygame):
        """塗りつぶし円の描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        position = Position(x=50, y=60)
        radius = 20
        color = Color(r=255, g=0, b=255)

        # pygame.drawをモック化
        with patch("pygame.draw") as mock_draw:
            renderer.draw_shape_circle(position, radius, color, filled=True)
            # 描画関数が呼ばれたことを確認
            assert mock_draw.circle.called

    def test_円描画_枠線のみ(self, headless_pygame):
        """枠線のみの円描画をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        position = Position(x=50, y=60)
        radius = 20
        color = Color(r=255, g=0, b=255)

        # pygame.drawをモック化
        with patch("pygame.draw") as mock_draw:
            renderer.draw_shape_circle(position, radius, color, filled=False)
            # 描画関数が呼ばれたことを確認
            assert mock_draw.circle.called

    def test_FPS取得(self, headless_pygame):
        """FPS取得機能をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        fps = renderer.get_fps()
        assert isinstance(fps, float)
        assert fps >= 0

    def test_フレーム制御(self, headless_pygame):
        """フレーム制御機能をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        elapsed = renderer.tick(60)
        assert isinstance(elapsed, int)
        assert elapsed >= 0

    def test_クリーンアップ(self, headless_pygame):
        """クリーンアップ機能をテストする"""
        config = create_test_config()
        renderer = PyGameRenderer(config)

        with patch("pygame.quit") as mock_quit:
            renderer.cleanup()
            mock_quit.assert_called_once()


class TestPyGameInputHandler(GuiTestCase):
    """PyGame入力ハンドラーのテスト"""

    def test_入力ハンドラー初期化(self, headless_pygame):
        """入力ハンドラーの初期化をテストする"""
        handler = PyGameInputHandler()
        assert handler is not None

    def test_空のイベント取得(self, headless_pygame):
        """空のイベントリスト取得をテストする"""
        handler = PyGameInputHandler()

        with patch("pygame.event.get", return_value=[]):
            events = handler.get_input_events()
            assert events == []

    def test_終了イベント取得(self, headless_pygame):
        """終了イベントの取得をテストする"""
        handler = PyGameInputHandler()

        quit_event = self.create_mock_event(12)  # pygame.QUIT
        with patch("pygame.event.get", return_value=[quit_event]):
            with patch("pygame.time.get_ticks", return_value=1000):
                events = handler.get_input_events()

                assert len(events) == 1
                assert events[0].event_type == "quit"

    def test_キー押下イベント取得(self, headless_pygame):
        """キー押下イベントの取得をテストする"""
        handler = PyGameInputHandler()

        # ESCキーイベント
        esc_event = self.create_mock_event(2, key=27)  # pygame.KEYDOWN, pygame.K_ESCAPE
        with patch("pygame.event.get", return_value=[esc_event]):
            with patch("pygame.time.get_ticks", return_value=1000):
                with patch("pygame.key.name", return_value="escape"):
                    events = handler.get_input_events()

                    assert len(events) == 1
                    assert events[0].event_type == "quit"
                    assert events[0].key == "escape"

    def test_マウスクリックイベント取得(self, headless_pygame):
        """マウスクリックイベントの取得をテストする"""
        handler = PyGameInputHandler()

        click_event = self.create_mock_event(5)  # pygame.MOUSEBUTTONDOWN
        with patch("pygame.event.get", return_value=[click_event]):
            with patch("pygame.time.get_ticks", return_value=1000):
                with patch("pygame.mouse.get_pos", return_value=(100, 200)):
                    events = handler.get_input_events()

                    assert len(events) == 1
                    assert events[0].event_type == "mouse_click"
                    # マウス位置は実装に依存するのでチェックしない


class TestPyGameApp(GuiTestCase):
    """PyGameアプリケーションのテスト"""

    def test_アプリ初期化_デフォルト設定(self, headless_pygame):
        """デフォルト設定でのアプリ初期化をテストする"""
        app = PyGameApp()

        assert app.config is not None
        assert app.config.mode == GameMode.GUI
        assert app.engine is not None
        assert app.renderer is not None
        assert app.input_handler is not None

    def test_アプリ初期化_カスタム設定(self, headless_pygame):
        """カスタム設定でのアプリ初期化をテストする"""
        config = create_test_config(language=Language.JA, debug=True)
        app = PyGameApp(config)

        assert app.config == config
        assert app.config.language == Language.JA
        assert app.config.debug is True

    def test_レンダリング処理(self, headless_pygame):
        """レンダリング処理をテストする"""
        config = create_test_config()
        app = PyGameApp(config)

        # エンジンをモック化してテストデータを提供
        app.engine.get_display_text = Mock(return_value="Test Display")
        app.engine.get_player_info = Mock(return_value="Player: Test")
        app.engine.get_game_info = Mock(return_value="Game: Test")
        app.engine.get_music_status = Mock(return_value="Playing")
        app.engine.get_shape_sample = Mock(return_value="Circle")
        app.engine.get_color_block_sample = Mock(return_value=(255, 128, 64))
        app.engine.get_japanese_sample = Mock(return_value="テスト")

        # レンダリングを実行（例外が発生しないことを確認）
        try:
            app._render()
        except Exception as e:
            pytest.fail(f"Rendering failed with exception: {e}")

    def test_ゲーム実行_短時間(self, headless_pygame):
        """短時間のゲーム実行をテストする"""
        config = create_test_config()
        app = PyGameApp(config)

        # エンジンを短時間で終了するようにモック化
        call_count = 0

        def mock_is_running():
            nonlocal call_count
            call_count += 1
            return call_count <= 3  # 3回のループで終了

        app.engine.is_running = mock_is_running
        app.engine.start = Mock()
        app.engine.handle_input = Mock()
        app.engine.update = Mock()
        app.engine.get_delta_time = Mock(return_value=0.016)
        app.engine.get_fps = Mock(return_value=60)

        # 入力イベントを空にする
        app.input_handler.get_input_events = Mock(return_value=[])

        # ゲーム実行（例外が発生しないことを確認）
        try:
            app.run()
        except Exception as e:
            pytest.fail(f"Game run failed with exception: {e}")

        # エンジンのメソッドが呼ばれたことを確認
        app.engine.start.assert_called_once()
        assert app.engine.update.call_count >= 3

"""
PyGame版ゲーム実装

PyGameを使用したGUI版のゲーム表示・操作
"""

from typing import Optional

import pygame  # type: ignore

from game.core import GameEngine
from game.models import Color, GameConfig, GameMode, InputEvent, Position, Size


class PyGameRenderer:
    """PyGameベースのレンダラー"""

    def __init__(self, config: GameConfig, engine: Optional[GameEngine] = None):
        """初期化

        Args:
            config: ゲーム設定
            engine: ゲームエンジン（アニメーション用）
        """
        self.config = config
        self.engine = engine
        self.screen: Optional[pygame.Surface] = None
        self.clock = pygame.time.Clock()

        # フォントキャッシュを初期化
        self._font_cache = {}
        self._japanese_font_name = None
        self._font_logged = False

        self._init_pygame()

    def _init_pygame(self) -> None:
        """PyGameを初期化"""
        pygame.init()

        # ディスプレイモードを設定
        flags = 0
        if self.config.fullscreen:
            flags |= pygame.FULLSCREEN

        self.screen = pygame.display.set_mode(
            (self.config.window_size.width, self.config.window_size.height), flags
        )
        pygame.display.set_caption("Python Game Template")

        # フォントを初期化
        pygame.font.init()

        # 日本語フォントを検出してキャッシュ
        self._initialize_japanese_font()

    def _initialize_japanese_font(self) -> None:
        """日本語フォントを初期化してキャッシュ"""
        font_candidates = [
            "msgothic",  # MS Gothic
            "msuigothic",  # MS UI Gothic
            "consolas",  # Consolas
            "couriernew",  # Courier New
        ]

        available_fonts = pygame.font.get_fonts()

        # 候補フォントを順番に試す
        for font_name in font_candidates:
            if font_name in available_fonts:
                try:
                    test_font = pygame.font.SysFont(font_name, 20)
                    test_surface = test_font.render("あいう", True, (255, 255, 255))
                    if test_surface.get_width() > 0:
                        self._japanese_font_name = font_name
                        # 初回のみログ出力
                        if not hasattr(self, "_font_logged"):
                            print(f"[GUI] Japanese font detected: {font_name}")
                            self._font_logged = True
                        return
                except Exception:
                    continue

        self._japanese_font_name = None
        # 初回のみログ出力
        if not hasattr(self, "_font_logged"):
            print("[GUI] No Japanese font found, using default font")
            self._font_logged = True

    def _get_font(self, size: int, use_japanese: bool = False) -> pygame.font.Font:
        """フォントをキャッシュから取得

        Args:
            size: フォントサイズ
            use_japanese: 日本語フォントを使用するかどうか

        Returns:
            フォント
        """
        cache_key = (size, use_japanese)

        if cache_key not in self._font_cache:
            if use_japanese and self._japanese_font_name:
                try:
                    font = pygame.font.SysFont(self._japanese_font_name, size)
                    self._font_cache[cache_key] = font
                except Exception:
                    font = pygame.font.Font(None, size)
                    self._font_cache[cache_key] = font
            else:
                font = pygame.font.Font(None, size)
                self._font_cache[cache_key] = font

        return self._font_cache[cache_key]

    def clear_screen(self, color: Color) -> None:
        """画面をクリア

        Args:
            color: クリア色
        """
        if self.screen:
            self.screen.fill(color.to_rgb_tuple())

    def draw_text(
        self,
        text: str,
        position: Position,
        color: Color = Color(r=255, g=255, b=255),
        font_size: int = 24,
    ) -> None:
        """テキストを描画

        Args:
            text: 描画するテキスト
            position: 描画位置
            color: テキスト色
            font_size: フォントサイズ
        """
        if not self.screen:
            return

        # 日本語文字が含まれているかチェック
        has_japanese = any(ord(char) > 127 for char in text)

        # キャッシュされたフォントを使用
        font = self._get_font(font_size, use_japanese=has_japanese)

        text_surface = font.render(text, True, color.to_rgb_tuple())
        self.screen.blit(text_surface, (position.x, position.y))

    def draw_centered_text(
        self,
        text: str,
        y_offset: int = 0,
        color: Color = Color(r=255, g=255, b=255),
        font_size: int = 48,
    ) -> None:
        """中央揃えでテキストを描画

        Args:
            text: 描画するテキスト
            y_offset: Y軸のオフセット
            color: テキスト色
            font_size: フォントサイズ
        """
        if not self.screen:
            return

        # 日本語文字が含まれているかチェック
        has_japanese = any(ord(char) > 127 for char in text)

        # キャッシュされたフォントを使用
        font = self._get_font(font_size, use_japanese=has_japanese)

        text_surface = font.render(text, True, color.to_rgb_tuple())
        text_rect = text_surface.get_rect()

        # 画面中央に配置
        screen_rect = self.screen.get_rect()
        text_rect.centerx = screen_rect.centerx
        text_rect.centery = screen_rect.centery + y_offset

        # アニメーションオフセットを適用
        if self.engine and hasattr(self.engine, "animation_time"):
            import math

            offset_x = int(math.sin(self.engine.animation_time * 2) * 10)
            text_rect.centerx += offset_x

        self.screen.blit(text_surface, text_rect)

    def draw_rectangle(
        self, position: Position, size: Size, color: Color, filled: bool = True
    ) -> None:
        """矩形を描画

        Args:
            position: 描画位置
            size: サイズ
            color: 色
            filled: 塗りつぶすかどうか
        """
        if not self.screen:
            return

        rect = pygame.Rect(position.x, position.y, size.width, size.height)

        if filled:
            pygame.draw.rect(self.screen, color.to_rgb_tuple(), rect)
        else:
            pygame.draw.rect(self.screen, color.to_rgb_tuple(), rect, 2)

    def draw_image(self, image_path: str, position: Position) -> bool:
        """画像を描画

        Args:
            image_path: 画像ファイルパス
            position: 描画位置

        Returns:
            描画に成功したかどうか
        """
        if not self.screen:
            return False

        try:
            image_surface = pygame.image.load(image_path)
            self.screen.blit(image_surface, (position.x, position.y))
            return True
        except Exception:
            # 画像が読み込めない場合は代替表示
            font = self._get_font(24, use_japanese=False)
            text_surface = font.render("[IMG]", True, (255, 255, 255))
            self.screen.blit(text_surface, (position.x, position.y))
            return False

    def draw_shape_circle(
        self, position: Position, radius: int, color: Color, filled: bool = True
    ) -> None:
        """円を描画

        Args:
            position: 中心位置
            radius: 半径
            color: 色
            filled: 塗りつぶすかどうか
        """
        if not self.screen:
            return

        if filled:
            pygame.draw.circle(
                self.screen, color.to_rgb_tuple(), (position.x, position.y), radius
            )
        else:
            pygame.draw.circle(
                self.screen, color.to_rgb_tuple(), (position.x, position.y), radius, 2
            )

    def present(self) -> None:
        """画面を更新"""
        pygame.display.flip()

    def get_fps(self) -> float:
        """現在のFPSを取得

        Returns:
            FPS値
        """
        return self.clock.get_fps()

    def tick(self, fps: int) -> int:
        """フレーム制御

        Args:
            fps: 目標FPS

        Returns:
            経過時間（ミリ秒）
        """
        return self.clock.tick(fps)

    def cleanup(self) -> None:
        """終了処理"""
        pygame.quit()


class PyGameInputHandler:
    """PyGame用の入力処理"""

    def get_input_events(self) -> list[InputEvent]:
        """入力イベントを取得

        Returns:
            入力イベントのリスト
        """
        events = []
        current_time = pygame.time.get_ticks() / 1000.0

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                events.append(InputEvent(event_type="quit", timestamp=current_time))
            elif event.type == pygame.KEYDOWN:
                key_name = pygame.key.name(event.key)

                # 特別なキーマッピング
                if event.key == pygame.K_ESCAPE:
                    events.append(
                        InputEvent(
                            event_type="quit", key=key_name, timestamp=current_time
                        )
                    )
                elif event.key == pygame.K_SPACE:
                    events.append(
                        InputEvent(
                            event_type="pause", key=key_name, timestamp=current_time
                        )
                    )
                elif event.key == pygame.K_r:
                    events.append(
                        InputEvent(
                            event_type="restart", key=key_name, timestamp=current_time
                        )
                    )
                elif event.key == pygame.K_m:
                    events.append(
                        InputEvent(
                            event_type="music_toggle",
                            key=key_name,
                            timestamp=current_time,
                        )
                    )
                else:
                    events.append(
                        InputEvent(
                            event_type="key_press", key=key_name, timestamp=current_time
                        )
                    )
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                events.append(
                    InputEvent(
                        event_type="mouse_click",
                        mouse_pos=Position(x=mouse_pos[0], y=mouse_pos[1]),
                        timestamp=current_time,
                    )
                )

        return events


class PyGameApp:
    """PyGame版ゲームアプリケーション"""

    def __init__(self, config: Optional[GameConfig] = None):
        """初期化

        Args:
            config: ゲーム設定
        """
        if config is None:
            config = GameConfig(mode=GameMode.GUI)

        self.config = config
        self.engine = GameEngine(config)
        self.renderer = PyGameRenderer(config, self.engine)
        self.input_handler = PyGameInputHandler()

    def run(self) -> None:
        """ゲームを実行"""
        try:
            self.engine.start()

            while self.engine.is_running():
                # 入力処理
                events = self.input_handler.get_input_events()
                for event in events:
                    self.engine.handle_input(event)

                # ゲーム更新
                delta_time = self.engine.get_delta_time()
                self.engine.update(delta_time)

                # 描画
                self._render()

                # フレーム制御
                self.renderer.tick(self.engine.get_fps())

        except Exception as e:
            print(f"Game error: {e}")
        finally:
            self.renderer.cleanup()

    def _render(self) -> None:
        """描画処理"""
        # 背景をクリア
        background_color = Color(r=20, g=20, b=40)  # 暗い青
        self.renderer.clear_screen(background_color)

        # メインテキストを表示
        main_text = self.engine.get_display_text()
        self.renderer.draw_centered_text(main_text, y_offset=-50)

        # プレイヤー情報を表示
        player_info = self.engine.get_player_info()
        self.renderer.draw_text(player_info, Position(x=10, y=10), font_size=18)

        # ゲーム情報を表示
        game_info = self.engine.get_game_info()
        self.renderer.draw_text(game_info, Position(x=10, y=35), font_size=18)

        # FPS表示
        fps_text = f"FPS: {self.renderer.get_fps():.1f}"
        self.renderer.draw_text(
            fps_text, Position(x=10, y=60), Color(r=255, g=255, b=0), font_size=16
        )  # 黄色

        # 音楽状態表示
        music_status = self.engine.get_music_status()
        music_text = f"Music: {music_status}"
        self.renderer.draw_text(
            music_text, Position(x=10, y=80), Color(r=0, g=255, b=255), font_size=16
        )  # シアン

        # 図形サンプル表示
        shape_sample = self.engine.get_shape_sample()
        self.renderer.draw_text(
            shape_sample, Position(x=10, y=100), Color(r=255, g=128, b=0), font_size=16
        )  # オレンジ

        # 画像サンプル表示
        image_path = "assets/images/test_icon.png"
        image_loaded = self.renderer.draw_image(image_path, Position(x=10, y=120))
        if image_loaded:
            image_text = "Image: Loaded successfully"
        else:
            image_text = "Image: Failed to load (showing fallback)"
        self.renderer.draw_text(
            image_text, Position(x=50, y=125), Color(r=128, g=255, b=128), font_size=16
        )  # 薄緑

        # 色付き円（カラーブロックの代替）
        rgb_color = self.engine.get_color_block_sample()
        self.renderer.draw_shape_circle(
            Position(x=30, y=150),
            15,
            Color(r=rgb_color[0], g=rgb_color[1], b=rgb_color[2]),
        )
        color_text = (
            f"Color Circle: RGB({rgb_color[0]}, {rgb_color[1]}, {rgb_color[2]})"
        )
        self.renderer.draw_text(
            color_text, Position(x=60, y=145), Color(r=200, g=200, b=200), font_size=16
        )  # グレー

        # 日本語サンプル表示
        japanese_sample = self.engine.get_japanese_sample()
        self.renderer.draw_text(
            japanese_sample,
            Position(x=10, y=170),
            Color(r=255, g=192, b=203),
            font_size=16,  # ピンク
        )

        # 操作説明
        help_text = "ESC: Quit | SPACE: Pause/Resume | R: Restart | M: Music Toggle"
        help_position = Position(x=10, y=self.config.window_size.height - 25)
        self.renderer.draw_text(
            help_text, help_position, Color(r=128, g=128, b=128), font_size=16
        )  # グレー

        # 画面更新
        self.renderer.present()

"""
PyGame版ゲーム実装

PyGameを使用したGUI版のゲーム表示・操作
"""

import sys
from typing import Optional

import pygame

from game.core import GameEngine
from game.models import Color, GameConfig, GameMode, InputEvent, Position, Size


class PyGameRenderer:
    """PyGameベースのレンダラー"""

    def __init__(self, config: GameConfig):
        """初期化

        Args:
            config: ゲーム設定
        """
        self.config = config
        self.screen: Optional[pygame.Surface] = None
        self.clock = pygame.time.Clock()

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

        font = pygame.font.Font(None, font_size)
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

        font = pygame.font.Font(None, font_size)
        text_surface = font.render(text, True, color.to_rgb_tuple())
        text_rect = text_surface.get_rect()

        # 画面中央に配置
        screen_rect = self.screen.get_rect()
        text_rect.centerx = screen_rect.centerx
        text_rect.centery = screen_rect.centery + y_offset

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
        self.renderer = PyGameRenderer(config)
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
            fps_text, Position(x=10, y=60), Color(r=255, g=255, b=0), font_size=16  # 黄色
        )

        # 操作説明
        help_text = "ESC: Quit | SPACE: Pause/Resume | R: Restart"
        help_position = Position(x=10, y=self.config.window_size.height - 25)
        self.renderer.draw_text(
            help_text, help_position, Color(r=128, g=128, b=128), font_size=16  # グレー
        )

        # 画面更新
        self.renderer.present()

"""
CUI版ゲーム実装

クロスプラットフォーム対応のターミナル制御を使用したCLI版のゲーム
"""

import time
from typing import Optional

from utils.terminal import Screen, TerminalController
from game.core import GameEngine
from game.models import GameConfig, GameMode, InputEvent


class CLIRenderer:
    """CLI版のレンダラー"""

    def __init__(self, terminal: TerminalController):
        """初期化

        Args:
            terminal: ターミナル制御オブジェクト
        """
        self.terminal = terminal
        self.screen = Screen(terminal)

    def clear_screen(self) -> None:
        """画面をクリア"""
        self.screen.clear()

    def draw_centered_text(self, text: str, y_offset: int = 0) -> None:
        """中央揃えでテキストを描画

        Args:
            text: 描画するテキスト
            y_offset: Y軸のオフセット
        """
        center_row, center_col = self.screen.get_center_position()
        target_row = center_row + y_offset

        if 0 <= target_row < self.screen.height:
            self.screen.center_text(target_row, text)

    def draw_text(self, row: int, col: int, text: str) -> None:
        """指定位置にテキストを描画

        Args:
            row: 行
            col: 列
            text: テキスト
        """
        self.screen.put_string(row, col, text)

    def draw_box(self, top: int, left: int, height: int, width: int) -> None:
        """矩形を描画

        Args:
            top: 上端の行
            left: 左端の列
            height: 高さ
            width: 幅
        """
        self.screen.draw_box(top, left, height, width, "*")

    def present(self) -> None:
        """画面を更新"""
        self.screen.refresh()


class CLIInputHandler:
    """CLI版の入力処理"""

    def __init__(self, terminal: TerminalController):
        """初期化

        Args:
            terminal: ターミナル制御オブジェクト
        """
        self.terminal = terminal

    def get_input_events(self) -> list[InputEvent]:
        """入力イベントを取得

        Returns:
            入力イベントのリスト
        """
        events = []
        current_time = time.time()

        # ノンブロッキングでキー入力をチェック
        key = self.terminal.get_key_press()

        if key:
            # 特別なキーマッピング
            if key == "\x1b":  # ESC
                events.append(
                    InputEvent(event_type="quit", key="escape", timestamp=current_time)
                )
            elif key == " ":  # スペース
                events.append(
                    InputEvent(event_type="pause", key="space", timestamp=current_time)
                )
            elif key.lower() == "q":
                events.append(
                    InputEvent(event_type="quit", key="q", timestamp=current_time)
                )
            elif key.lower() == "r":
                events.append(
                    InputEvent(event_type="restart", key="r", timestamp=current_time)
                )
            elif key.lower() == "p":
                events.append(
                    InputEvent(event_type="pause", key="p", timestamp=current_time)
                )
            else:
                events.append(
                    InputEvent(event_type="key_press", key=key, timestamp=current_time)
                )

        return events


class CLIApp:
    """CLI版ゲームアプリケーション"""

    def __init__(self, config: Optional[GameConfig] = None):
        """初期化

        Args:
            config: ゲーム設定
        """
        if config is None:
            config = GameConfig(mode=GameMode.CLI)

        self.config = config
        self.engine = GameEngine(config)
        self.terminal = TerminalController()
        self.renderer = CLIRenderer(self.terminal)
        self.input_handler = CLIInputHandler(self.terminal)

        self.last_frame_time = time.time()

    def run(self) -> None:
        """ゲームを実行"""
        try:
            with self.terminal:  # コンテキストマネージャーで自動クリーンアップ
                self.terminal.hide_cursor()
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

                    # フレーム制御（CLI版では低めのFPSで十分）
                    self._limit_fps(30)

        except KeyboardInterrupt:
            # Ctrl+C での終了
            pass
        except Exception as e:
            print(f"\nGame error: {e}")
        finally:
            self.terminal.show_cursor()
            self.terminal.reset_color()

    def _render(self) -> None:
        """描画処理"""
        self.renderer.clear_screen()

        # 画面サイズを取得
        height, width = self.terminal.get_terminal_size()

        # 枠を描画
        self.renderer.draw_box(0, 0, height - 1, width)

        # メインテキストを中央に表示
        main_text = self.engine.get_display_text()
        self.renderer.draw_centered_text(main_text, y_offset=-3)

        # プレイヤー情報を表示
        player_info = self.engine.get_player_info()
        if len(player_info) <= width - 4:
            self.renderer.draw_text(2, 2, player_info)
        else:
            # 長すぎる場合は短縮
            short_info = player_info[: width - 7] + "..."
            self.renderer.draw_text(2, 2, short_info)

        # ゲーム情報を表示
        game_info = self.engine.get_game_info()
        if len(game_info) <= width - 4:
            self.renderer.draw_text(3, 2, game_info)
        else:
            # 長すぎる場合は短縮
            short_info = game_info[: width - 7] + "..."
            self.renderer.draw_text(3, 2, short_info)

        # 操作説明を下部に表示
        help_lines = ["Controls:", "Q/ESC: Quit", "P/SPACE: Pause/Resume", "R: Restart"]

        start_row = max(5, height - len(help_lines) - 3)
        for i, line in enumerate(help_lines):
            if start_row + i < height - 2 and len(line) <= width - 4:
                self.renderer.draw_text(start_row + i, 2, line)

        # 画面更新
        self.renderer.present()

    def _limit_fps(self, target_fps: int) -> None:
        """FPSを制限

        Args:
            target_fps: 目標FPS
        """
        frame_time = 1.0 / target_fps
        current_time = time.time()
        elapsed = current_time - self.last_frame_time

        if elapsed < frame_time:
            sleep_time = frame_time - elapsed
            time.sleep(sleep_time)

        self.last_frame_time = time.time()

"""
CUI版ゲーム実装

クロスプラットフォーム対応のターミナル制御を使用したCUI版のゲーム
"""

import sys
import time
from typing import Optional

from utils.terminal import Screen, TerminalController
from game.core import GameEngine
from game.models import GameConfig, GameMode, InputEvent


class CUIRenderer:
    """CUI版のレンダラー"""

    def __init__(self, terminal: TerminalController):
        """初期化

        Args:
            terminal: ターミナル制御オブジェクト
        """
        self.terminal = terminal
        self.screen = Screen(terminal)

    def clear_screen(self) -> None:
        """バッファをクリア（実際の画面はクリアしない）"""
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


class CUIInputHandler:
    """CUI版の入力処理"""

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


class CUIApp:
    """CUI版ゲームアプリケーション"""

    def __init__(self, config: Optional[GameConfig] = None):
        """初期化

        Args:
            config: ゲーム設定
        """
        if config is None:
            config = GameConfig(mode=GameMode.CUI)

        self.config = config
        self.engine = GameEngine(config)
        self.terminal = TerminalController()
        self.renderer = CUIRenderer(self.terminal)
        self.input_handler = CUIInputHandler(self.terminal)

        self.last_frame_time = time.time()
        self.last_game_info = ""  # 前回のゲーム情報をキャッシュ

    def run(self) -> None:
        """ゲームを実行"""
        
        try:
            with self.terminal:  # コンテキストマネージャーで自動クリーンアップ
                self.terminal.hide_cursor()
                self.engine.start()
                
                # 最初に一度だけ画面をクリア
                self.terminal.clear_screen()
                
                start_time = time.time()
                auto_quit_seconds = 10
                frame_count = 0

                while self.engine.is_running():
                    frame_count += 1
                    current_time = time.time()
                    elapsed = current_time - start_time
                    
                    # 自動終了チェック（デモ用）
                    if elapsed > auto_quit_seconds:
                        print(f"\nAuto-quit after {auto_quit_seconds} seconds (frame {frame_count})", flush=True)
                        break
                    # 入力処理
                    events = self.input_handler.get_input_events()
                    for event in events:
                        self.engine.handle_input(event)

                    # ゲーム更新
                    delta_time = self.engine.get_delta_time()
                    self.engine.update(delta_time)

                    # 描画
                    self._render()

                    # フレーム制御（CUI版では低めのFPSで十分）
                    self._limit_fps(10)

        except KeyboardInterrupt:
            # Ctrl+C での終了
            print("\nGame interrupted by user", flush=True)
        except Exception as e:
            print(f"\nGame error: {e}")
        finally:
            # ターミナル状態を完全にリセット
            try:
                self.terminal.reset_terminal()
                print("Game ended.")
            except Exception:
                # 最低限のリセット処理
                print("\033[0m\033[?25h\033[?1049l\033[?1000l\033[r\033[H\033[2J\033[3J")
                print("Game ended.")

    def _render(self) -> None:
        """描画処理"""
        # 現在のゲーム情報を取得
        current_game_info = self.engine.get_game_info()
        
        # 内容が変わった場合のみ更新
        if current_game_info != self.last_game_info:
            # バッファをクリア（画面はクリアしない）
            self.renderer.clear_screen()

            # 画面サイズを取得（実際のバッファサイズを使用）
            height = self.renderer.screen.height
            width = self.renderer.screen.width

            # 枠を描画
            self.renderer.draw_box(0, 0, height, width)

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
            if len(current_game_info) <= width - 4:
                self.renderer.draw_text(3, 2, current_game_info)
            else:
                # 長すぎる場合は短縮
                short_info = current_game_info[: width - 7] + "..."
                self.renderer.draw_text(3, 2, short_info)

            # 操作説明を下部に表示
            help_lines = ["Controls:", "Q/ESC: Quit", "P/SPACE: Pause/Resume", "R: Restart"]

            start_row = max(5, height - len(help_lines) - 3)
            for i, line in enumerate(help_lines):
                if start_row + i < height - 2 and len(line) <= width - 4:
                    self.renderer.draw_text(start_row + i, 2, line)

            # 画面更新
            self.renderer.present()
            
            # 前回の情報を更新
            self.last_game_info = current_game_info

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

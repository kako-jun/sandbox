"""
クロスプラットフォーム対応のターミナル制御ライブラリ

ncursesを直接使わずに、WindowsとLinuxの両方で動作する
ターミナル制御機能を提供する
"""

import io
import os
import sys
import time
from typing import Dict, List, Optional, Tuple, Union

try:
    import msvcrt  # Windows用
except ImportError:
    msvcrt = None

try:
    import termios  # Unix系用
    import tty
except ImportError:
    termios = None
    tty = None


class TerminalController:
    """クロスプラットフォーム対応のターミナル制御クラス"""

    def __init__(self) -> None:
        """初期化"""
        self.is_windows = os.name == "nt"
        self.original_settings: Optional[List] = None
        self._init_terminal()

    def _init_terminal(self) -> None:
        """ターミナルの初期化"""
        if not self.is_windows and termios is not None:
            # Unix系の場合、現在の設定を保存
            try:
                self.original_settings = termios.tcgetattr(sys.stdin)
            except (termios.error, OSError, io.UnsupportedOperation):
                self.original_settings = None

    def clear_screen(self) -> None:
        """画面をクリア"""
        if self.is_windows:
            os.system("cls")
        else:
            os.system("clear")

    def move_cursor(self, row: int, col: int) -> None:
        """カーソルを指定位置に移動"""
        print(f"\033[{row};{col}H", end="", flush=True)

    def hide_cursor(self) -> None:
        """カーソルを非表示にする"""
        print("\033[?25l", end="", flush=True)

    def show_cursor(self) -> None:
        """カーソルを表示する"""
        print("\033[?25h", end="", flush=True)

    def get_terminal_size(self) -> Tuple[int, int]:
        """ターミナルのサイズを取得 (行数, 列数)"""
        try:
            import shutil

            size = shutil.get_terminal_size()
            return size.lines, size.columns
        except (ValueError, OSError):
            # デフォルトサイズを返す
            return 24, 80

    def set_color(
        self, fg_color: Optional[str] = None, bg_color: Optional[str] = None
    ) -> None:
        """文字色と背景色を設定"""
        color_codes = {
            "black": 30,
            "red": 31,
            "green": 32,
            "yellow": 33,
            "blue": 34,
            "magenta": 35,
            "cyan": 36,
            "white": 37,
        }

        if fg_color and fg_color in color_codes:
            print(f"\033[{color_codes[fg_color]}m", end="", flush=True)

        if bg_color and bg_color in color_codes:
            print(f"\033[{color_codes[bg_color] + 10}m", end="", flush=True)

    def reset_color(self) -> None:
        """色をリセット"""
        print("\033[0m", end="", flush=True)

    def get_key_press(self) -> Optional[str]:
        """キー入力を取得（ノンブロッキング）"""
        if self.is_windows and msvcrt is not None:
            if msvcrt.kbhit():
                key = msvcrt.getch().decode("utf-8", errors="ignore")
                return key
            return None
        else:
            # Unix系の場合
            if termios is None or tty is None:
                return None

            try:
                # ノンブロッキングモードに設定
                old_settings = termios.tcgetattr(sys.stdin)
                tty.setraw(sys.stdin.fileno())

                # 入力があるかチェック
                import select

                if select.select([sys.stdin], [], [], 0) == ([sys.stdin], [], []):
                    key = sys.stdin.read(1)
                    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
                    return key
                else:
                    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
                    return None
            except (termios.error, ImportError):
                return None

    def wait_for_key(self) -> str:
        """キー入力を待機"""
        if self.is_windows and msvcrt is not None:
            return msvcrt.getch().decode("utf-8", errors="ignore")
        else:
            if termios is None or tty is None:
                return input()[:1]  # フォールバック

            try:
                old_settings = termios.tcgetattr(sys.stdin)
                tty.setraw(sys.stdin.fileno())
                key = sys.stdin.read(1)
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
                return key
            except (termios.error, ImportError):
                return input()[:1]  # フォールバック

    def cleanup(self) -> None:
        """終了処理"""
        self.show_cursor()
        self.reset_color()
        if (
            not self.is_windows
            and self.original_settings is not None
            and termios is not None
        ):
            try:
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.original_settings)
            except termios.error:
                pass

    def __enter__(self):
        """コンテキストマネージャーの開始"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """コンテキストマネージャーの終了"""
        self.cleanup()


class Screen:
    """画面表示を管理するクラス"""

    def __init__(self, terminal: TerminalController):
        """初期化"""
        self.terminal = terminal
        self.height, self.width = terminal.get_terminal_size()
        self.buffer: List[List[str]] = [
            [" " for _ in range(self.width)] for _ in range(self.height)
        ]

    def clear(self) -> None:
        """バッファをクリア"""
        for row in self.buffer:
            for i in range(len(row)):
                row[i] = " "

    def put_char(self, row: int, col: int, char: str) -> None:
        """指定位置に文字を配置"""
        if 0 <= row < self.height and 0 <= col < self.width:
            self.buffer[row][col] = char

    def put_string(self, row: int, col: int, text: str) -> None:
        """指定位置に文字列を配置"""
        for i, char in enumerate(text):
            if col + i >= self.width:
                break
            self.put_char(row, col + i, char)

    def draw_box(
        self, top: int, left: int, height: int, width: int, border_char: str = "*"
    ) -> None:
        """矩形を描画"""
        # 上下の線
        for col in range(left, min(left + width, self.width)):
            if top >= 0 and top < self.height:
                self.put_char(top, col, border_char)
            if top + height - 1 >= 0 and top + height - 1 < self.height:
                self.put_char(top + height - 1, col, border_char)

        # 左右の線
        for row in range(top, min(top + height, self.height)):
            if left >= 0 and left < self.width:
                self.put_char(row, left, border_char)
            if left + width - 1 >= 0 and left + width - 1 < self.width:
                self.put_char(row, left + width - 1, border_char)

    def center_text(self, row: int, text: str) -> None:
        """中央揃えでテキストを配置"""
        col = max(0, (self.width - len(text)) // 2)
        self.put_string(row, col, text)

    def refresh(self) -> None:
        """画面を更新"""
        self.terminal.clear_screen()
        self.terminal.move_cursor(1, 1)

        for row_data in self.buffer:
            print("".join(row_data))

    def get_center_position(self) -> Tuple[int, int]:
        """画面中央の位置を取得"""
        return self.height // 2, self.width // 2

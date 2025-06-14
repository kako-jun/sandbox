"""
クロスプラットフォーム対応のターミナル制御ライブラリ

ncursesを直接使わずに、WindowsとLinuxの両方で動作する
ターミナル制御機能を提供する
"""

import atexit
import io
import os
import signal
import sys
import time
import threading
import queue
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


# グローバルなターミナル状態管理
_terminal_instances = []
_cleanup_registered = False


def _global_cleanup():
    """グローバルクリーンアップ関数（atexit/signal用）"""
    # VSCode統合ターミナル対応
    is_vscode = os.environ.get("TERM_PROGRAM") == "vscode"

    if is_vscode:
        reset_sequence = (
            "\033[?1049l"  # 代替画面バッファ無効化
            "\033[0m"  # 属性リセット
            "\033[?25h"  # カーソル表示
            "\033[r"  # スクロール領域リセット
            "\033[?1000l"  # マウストラッキング無効化
            "\033[?1006l"  # SGRマウストラッキング無効化
            "\033[?1015l"  # Urxvtマウストラッキング無効化
            "\033[?2004l"  # ブラケットペーストモード無効化
            "\033[H"  # カーソルをホーム位置に移動
            "\033[2J"  # 画面クリア
        )
    else:
        reset_sequence = (
            "\033[?1049l"  # 代替画面バッファ無効化
            "\033[0m"  # 属性リセット
            "\033[?25h"  # カーソル表示
            "\033[r"  # スクロール領域リセット
        )

    sys.stdout.write(reset_sequence)
    sys.stdout.flush()
    sys.stderr.flush()

    # 全てのターミナルインスタンスをクリーンアップ（ただし重複実行を避ける）
    instances_copy = _terminal_instances.copy()
    for terminal in instances_copy:
        try:
            terminal._running = False
            if hasattr(terminal, "original_settings") and terminal.original_settings:
                if termios is not None:
                    termios.tcsetattr(
                        sys.stdin, termios.TCSADRAIN, terminal.original_settings
                    )
            
            # Linuxでのstty追加リセット（グローバルクリーンアップ時）
            if not terminal.is_windows:
                try:
                    import subprocess
                    subprocess.run(["stty", "onlcr"], check=False, capture_output=True)
                    subprocess.run(["stty", "opost"], check=False, capture_output=True)
                except (subprocess.SubprocessError, FileNotFoundError, AttributeError):
                    pass
        except Exception:
            pass


def _signal_handler(signum, frame):
    """シグナルハンドラー"""
    _global_cleanup()
    # デフォルトのシグナルハンドラーで終了
    signal.signal(signum, signal.SIG_DFL)
    os.kill(os.getpid(), signum)


class TerminalController:
    """クロスプラットフォーム対応のターミナル制御クラス"""

    def __init__(self) -> None:
        """初期化"""
        global _cleanup_registered, _terminal_instances

        self.is_windows = os.name == "nt"
        self.original_settings: Optional[List] = None
        self._input_queue: queue.Queue = queue.Queue()
        self._input_thread: Optional[threading.Thread] = None
        self._running = False

        # グローバルリストに追加
        _terminal_instances.append(self)

        # 初回のみクリーンアップ登録
        if not _cleanup_registered:
            atexit.register(_global_cleanup)
            if not self.is_windows:
                # メインスレッドでのみシグナルハンドラーを設定
                try:
                    signal.signal(signal.SIGTERM, _signal_handler)
                    signal.signal(signal.SIGINT, _signal_handler)
                    signal.signal(signal.SIGHUP, _signal_handler)
                except ValueError:
                    # signal only works in main thread - サブスレッドでは無視
                    pass
            _cleanup_registered = True

        self._init_terminal()
        self._start_input_thread()

    def _init_terminal(self) -> None:
        """ターミナルの初期化"""
        if not self.is_windows and termios is not None:
            # Unix系の場合、現在の設定を保存
            try:
                self.original_settings = termios.tcgetattr(sys.stdin)
            except (termios.error, OSError, io.UnsupportedOperation):
                self.original_settings = None

    def _start_input_thread(self) -> None:
        """入力処理用スレッドを開始"""
        self._running = True
        self._input_thread = threading.Thread(target=self._input_worker, daemon=True)
        self._input_thread.start()

    def _input_worker(self) -> None:
        """入力処理ワーカー（別スレッドで実行）"""
        while self._running:
            try:
                if self.is_windows and msvcrt is not None:
                    if msvcrt.kbhit():
                        key = msvcrt.getch().decode("utf-8", errors="ignore")
                        self._input_queue.put(key)
                else:
                    # Unix系での入力処理
                    try:
                        # keyboardライブラリを試す
                        import keyboard

                        # よく使われるキーをチェック
                        keys_to_check = ["q", "esc", "space", "r", "p"]
                        for key_name in keys_to_check:
                            if keyboard.is_pressed(key_name):
                                if key_name == "esc":
                                    self._input_queue.put("\x1b")
                                elif key_name == "space":
                                    self._input_queue.put(" ")
                                else:
                                    self._input_queue.put(key_name)
                                time.sleep(0.1)  # キーリピートを防ぐ
                                break
                    except ImportError:
                        # keyboardライブラリがない場合、標準的な方法を試す
                        if sys.stdin.isatty():
                            try:
                                if termios is not None and tty is not None:
                                    old_settings = termios.tcgetattr(sys.stdin)
                                    tty.setraw(sys.stdin.fileno())
                                    try:
                                        import select

                                        if select.select([sys.stdin], [], [], 0.1)[0]:
                                            key = sys.stdin.read(1)
                                            self._input_queue.put(key)
                                    finally:
                                        termios.tcsetattr(
                                            sys.stdin, termios.TCSADRAIN, old_settings
                                        )
                            except (termios.error, OSError, IOError):
                                pass
                time.sleep(0.05)  # CPU使用率を下げる
            except Exception:
                pass  # エラーを無視して継続

    def clear_screen(self) -> None:
        """画面をクリア"""
        if self.is_windows:
            os.system("cls")
        else:
            # 代替画面バッファを使用してクリア
            print("\033[?1049h\033[H\033[2J", end="", flush=True)

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

    def reset_terminal(self) -> None:
        """ターミナル状態を完全にリセット"""
        # VSCode統合ターミナルを検出
        is_vscode = os.environ.get("TERM_PROGRAM") == "vscode"

        if is_vscode:
            # VSCode統合ターミナル用：より確実なリセット
            reset_sequence = (
                "\033[?1049l"  # 代替画面バッファ無効化
                "\033[0m"  # 属性リセット
                "\033[?25h"  # カーソル表示
                "\033[r"  # スクロール領域リセット
                "\033[?1000l"  # マウストラッキング無効化
                "\033[?1006l"  # SGRマウストラッキング無効化
                "\033[?1015l"  # Urxvtマウストラッキング無効化
                "\033[?2004l"  # ブラケットペーストモード無効化
                "\033[H"  # カーソルをホーム位置に移動
                "\033[2J"  # 画面クリア
            )
            print(reset_sequence, end="", flush=True)
            
            # Linuxでの改行処理リセット
            if not self.is_windows and self.original_settings and termios is not None:
                try:
                    # 端末設定を元に戻す（特に改行処理）
                    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.original_settings)
                    # 強制的に端末の行出力設定をリセット
                    import tty
                    # 一時的にrawモードにしてからリセット
                    current_settings = termios.tcgetattr(sys.stdin)
                    termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.original_settings)
                except (termios.error, OSError, ImportError):
                    pass
            
            # 追加で標準出力をフラッシュ
            sys.stdout.flush()
            sys.stderr.flush()
        else:
            # 通常のターミナル用
            # 代替画面バッファを無効化して元の画面に戻る
            print("\033[?1049l", end="", flush=True)

            # その他の状態をリセット
            reset_sequence = (
                "\033[0m"  # 属性リセット
                "\033[?25h"  # カーソル表示
                "\033[?1000l"  # マウストラッキング無効化
                "\033[?1006l"  # SGRマウストラッキング無効化
                "\033[?1015l"  # Urxvtマウストラッキング無効化
                "\033[?2004l"  # ブラケットペーストモード無効化
                "\033[r"  # スクロール領域リセット
            )
            print(reset_sequence, end="", flush=True)

        # Linuxでsttyを使った追加の改行処理リセット
        if not self.is_windows:
            try:
                import subprocess
                # sttyコマンドで改行処理を正常化
                subprocess.run(["stty", "onlcr"], check=False, capture_output=True)
                subprocess.run(["stty", "opost"], check=False, capture_output=True)
            except (subprocess.SubprocessError, FileNotFoundError):
                pass
        
        # 最後に改行を出力して正常な出力位置に戻す
        print("")

    def get_key_press(self) -> Optional[str]:
        """キー入力を取得（ノンブロッキング）"""
        try:
            # キューから入力を取得（ノンブロッキング）
            return self._input_queue.get_nowait()
        except queue.Empty:
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
        global _terminal_instances

        # 既にクリーンアップ済みの場合は何もしない
        if not hasattr(self, "_running") or not self._running:
            return

        # 入力スレッドを停止
        self._running = False
        if self._input_thread and self._input_thread.is_alive():
            self._input_thread.join(timeout=1.0)

        # ターミナル状態を完全にリセット
        self.reset_terminal()

        # Unix系の場合、元の設定を復元
        if (
            not self.is_windows
            and self.original_settings is not None
            and termios is not None
        ):
            try:
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.original_settings)
            except termios.error:
                pass

        # グローバルリストから削除
        try:
            _terminal_instances.remove(self)
        except ValueError:
            pass

    def __enter__(self):
        """コンテキストマネージャーの開始"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """コンテキストマネージャーの終了"""
        self.cleanup()
        # 追加のリセット処理
        import sys

        sys.stdout.flush()
        sys.stderr.flush()


class Screen:
    """画面表示を管理するクラス"""

    def __init__(self, terminal: TerminalController):
        """初期化"""
        self.terminal = terminal
        terminal_height, self.width = terminal.get_terminal_size()
        # 最下行を避けてスクロールを防ぐため、高さを1減らす
        self.height = terminal_height - 1
        self.buffer: List[List[str]] = [
            [" " for _ in range(self.width)] for _ in range(self.height)
        ]
        self.previous_buffer: List[List[str]] = [
            [" " for _ in range(self.width)] for _ in range(self.height)
        ]
        self.needs_full_refresh = True

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
        # 各行を正確な位置に描画（最下行は避けてスクロールを防ぐ）
        for row_idx, row_data in enumerate(self.buffer):
            # 最下行（ターミナルの最後の行）は描画を避ける
            if row_idx >= self.height - 1:
                break

            # カーソルを該当行の先頭に移動
            self.terminal.move_cursor(row_idx + 1, 1)
            # 行全体を出力（end=""で改行を避ける）
            line = "".join(row_data)
            print(line, end="", flush=True)

        # 最後にカーソルを画面外の安全な位置に移動（スクロールを防ぐ）
        # ターミナルの最下行ではなく、画面の最下行の次の行（存在しない行）に移動
        self.terminal.move_cursor(self.height, 1)

    def get_center_position(self) -> Tuple[int, int]:
        """画面中央の位置を取得"""
        return self.height // 2, self.width // 2

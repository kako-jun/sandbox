"""
ターミナル制御機能のテスト
"""

import pytest

import sys
from pathlib import Path

src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from utils.terminal import Screen, TerminalController


class TestTerminalController:
    """TerminalController クラスのテスト"""

    def test_初期化(self):
        """ターミナルコントローラーが正常に初期化される"""
        controller = TerminalController()
        assert controller is not None

    def test_ターミナルサイズ取得(self):
        """ターミナルサイズを取得できる"""
        controller = TerminalController()
        rows, cols = controller.get_terminal_size()

        # 最小サイズをチェック
        assert rows >= 1
        assert cols >= 1

        # デフォルトサイズまたは実際のサイズ
        assert (rows, cols) == (24, 80) or (rows > 0 and cols > 0)

    def test_コンテキストマネージャー(self):
        """コンテキストマネージャーとして使用できる"""
        with TerminalController() as controller:
            assert controller is not None
        # 正常に終了すれば成功


class TestScreen:
    """Screen クラスのテスト"""

    def test_初期化(self):
        """スクリーンが正常に初期化される"""
        controller = TerminalController()
        screen = Screen(controller)

        assert screen.height >= 1
        assert screen.width >= 1
        assert len(screen.buffer) == screen.height
        assert len(screen.buffer[0]) == screen.width

    def test_バッファクリア(self):
        """バッファをクリアできる"""
        controller = TerminalController()
        screen = Screen(controller)

        # 文字を配置
        screen.put_char(0, 0, "X")
        assert screen.buffer[0][0] == "X"

        # クリア
        screen.clear()
        assert screen.buffer[0][0] == " "

    def test_文字配置(self):
        """指定位置に文字を配置できる"""
        controller = TerminalController()
        screen = Screen(controller)

        screen.put_char(1, 2, "A")
        assert screen.buffer[1][2] == "A"

    def test_範囲外文字配置(self):
        """範囲外への文字配置は無視される"""
        controller = TerminalController()
        screen = Screen(controller)

        # 範囲外座標（エラーにならないことを確認）
        screen.put_char(-1, 0, "X")
        screen.put_char(0, -1, "X")
        screen.put_char(screen.height, 0, "X")
        screen.put_char(0, screen.width, "X")

        # 正常終了すれば成功

    def test_文字列配置(self):
        """指定位置に文字列を配置できる"""
        controller = TerminalController()
        screen = Screen(controller)

        screen.put_string(1, 2, "Hello")
        assert screen.buffer[1][2] == "H"
        assert screen.buffer[1][3] == "e"
        assert screen.buffer[1][4] == "l"
        assert screen.buffer[1][5] == "l"
        assert screen.buffer[1][6] == "o"

    def test_長すぎる文字列配置(self):
        """画面幅を超える文字列は途中で切り取られる"""
        controller = TerminalController()
        screen = Screen(controller)

        # 画面幅ギリギリの位置から長い文字列を配置
        long_string = "A" * (screen.width + 10)
        screen.put_string(0, screen.width - 5, long_string)

        # 画面内の文字のみ配置される
        assert screen.buffer[0][screen.width - 5] == "A"
        assert screen.buffer[0][screen.width - 1] == "A"

    def test_矩形描画(self):
        """矩形を描画できる"""
        controller = TerminalController()
        screen = Screen(controller)

        # 5x3の矩形を(1,1)に描画
        screen.draw_box(1, 1, 3, 5, "#")

        # 上下の線
        assert screen.buffer[1][1] == "#"
        assert screen.buffer[1][2] == "#"
        assert screen.buffer[1][5] == "#"
        assert screen.buffer[3][1] == "#"
        assert screen.buffer[3][5] == "#"

        # 左右の線
        assert screen.buffer[2][1] == "#"
        assert screen.buffer[2][5] == "#"

    def test_中央揃えテキスト(self):
        """中央揃えでテキストを配置できる"""
        controller = TerminalController()
        screen = Screen(controller)

        text = "Test"
        screen.center_text(1, text)

        # 中央位置を計算
        expected_col = (screen.width - len(text)) // 2
        assert screen.buffer[1][expected_col] == "T"
        assert screen.buffer[1][expected_col + 1] == "e"
        assert screen.buffer[1][expected_col + 2] == "s"
        assert screen.buffer[1][expected_col + 3] == "t"

    def test_中央位置取得(self):
        """画面中央の位置を取得できる"""
        controller = TerminalController()
        screen = Screen(controller)

        center_row, center_col = screen.get_center_position()
        assert center_row == screen.height // 2
        assert center_col == screen.width // 2

    def test_画面更新(self):
        """画面更新が正常に実行される"""
        controller = TerminalController()
        screen = Screen(controller)

        # エラーにならなければ成功
        screen.refresh()

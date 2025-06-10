import os
import time
import argparse
import platform
from colorama import init, Fore, Back, Style
from core.tetris import Tetris

# プラットフォームに応じてcursesをインポート
if platform.system() == 'Windows':
    try:
        import windows.curses as curses
    except ImportError:
        print("Please install windows-curses: pip install windows-curses")
        exit(1)
else:
    try:
        import curses
    except ImportError:
        print("Please install curses: pip install curses")
        exit(1)

def init_colors():
    """色の初期化"""
    curses.start_color()
    curses.use_default_colors()
    # 色の定義
    curses.init_pair(1, curses.COLOR_CYAN, curses.COLOR_CYAN)
    curses.init_pair(2, curses.COLOR_YELLOW, curses.COLOR_YELLOW)
    curses.init_pair(3, curses.COLOR_MAGENTA, curses.COLOR_MAGENTA)
    curses.init_pair(4, curses.COLOR_GREEN, curses.COLOR_GREEN)
    curses.init_pair(5, curses.COLOR_RED, curses.COLOR_RED)
    curses.init_pair(6, curses.COLOR_BLUE, curses.COLOR_BLUE)
    curses.init_pair(7, curses.COLOR_YELLOW, curses.COLOR_YELLOW)

def get_color_code(color: str) -> int:
    """色名からcursesの色コードを取得"""
    color_map = {
        'cyan': 1,
        'yellow': 2,
        'magenta': 3,
        'green': 4,
        'red': 5,
        'blue': 6,
        'orange': 7,
    }
    return color_map.get(color, 0)

def draw_preview(stdscr, pieces, start_x: int, start_y: int):
    """次のテトリミノを表示"""
    for i, piece in enumerate(pieces):
        stdscr.addstr(start_y + i * 4, start_x, f"Next {i+1}:")
        # プレビュー用のグリッドを作成
        grid = [[' ' for _ in range(4)] for _ in range(4)]
        # テトリミノを配置
        for y, x in piece.shape:
            grid[y][x] = '■'
        # グリッドを表示
        for j, row in enumerate(grid):
            stdscr.addstr(start_y + i * 4 + 1 + j, start_x, '  ' + ''.join(row))

def draw_board(stdscr, game: Tetris, player_num: int, start_x: int):
    """ゲームボードを描画"""
    board, colors = game.get_board_state()
    
    stdscr.addstr(1, start_x, f"Player {player_num} - Score: {game.get_score()}")
    stdscr.addstr(2, start_x, "  " + "=" * (game.width * 2 + 2))
    
    for i, (row, color_row) in enumerate(zip(board, colors)):
        stdscr.addstr(3 + i, start_x, "  |")
        for cell, color in zip(row, color_row):
            if cell == 0:
                stdscr.addstr("  ")
            elif cell == 1:
                stdscr.addstr("  ", curses.color_pair(get_color_code(color)))
            else:
                stdscr.addstr("  ", curses.color_pair(get_color_code(game.current_color)))
        stdscr.addstr("|")
    
    stdscr.addstr(3 + len(board), start_x, "  " + "=" * (game.width * 2 + 2))

def handle_key_input(key: int, game1: Tetris, game2: Tetris) -> bool:
    """キー入力の処理"""
    # プレイヤー1の操作
    if key in [ord('a'), curses.KEY_LEFT]:  # 左
        game1.move(-1, 0)
    elif key in [ord('d'), curses.KEY_RIGHT]:  # 右
        game1.move(1, 0)
    elif key in [ord('w'), curses.KEY_UP]:  # 上（回転）
        game1.rotate_piece()
    elif key in [ord('s'), curses.KEY_DOWN]:  # 下
        game1.move(0, 1)
    elif key == ord(' '):  # スペース（ハードドロップ）
        game1.hard_drop()
    # プレイヤー2の操作
    elif key == ord('j'):  # 左
        game2.move(-1, 0)
    elif key == ord('l'):  # 右
        game2.move(1, 0)
    elif key == ord('i'):  # 上（回転）
        game2.rotate_piece()
    elif key == ord('k'):  # 下
        game2.move(0, 1)
    elif key == ord('\n'):  # エンター（ハードドロップ）
        game2.hard_drop()
    elif key == ord('q'):
        return True  # ゲーム終了
    return False

def main(stdscr):
    """メインゲームループ"""
    # 画面の設定
    curses.curs_set(0)  # カーソルを非表示
    curses.noecho()  # キー入力をエコーしない
    stdscr.keypad(True)  # 特殊キーを有効化
    init_colors()

    # ゲームの初期化
    game1 = Tetris(width=10, height=20)
    game2 = Tetris(width=10, height=20)
    
    last_move_time = time.time()
    move_interval = 0.5  # 自動落下の間隔（秒）

    # 画面の幅を計算
    screen_width = 2 + game1.width * 2 + 20 + game2.width * 2 + 20
    screen_height = max(game1.height, game2.height) + 8

    try:
        while not (game1.game_over or game2.game_over):
            stdscr.clear()
            
            # プレイヤー1のボードとプレビューを描画
            draw_board(stdscr, game1, 1, 2)
            draw_preview(stdscr, game1.get_next_pieces(), 2 + game1.width * 2 + 4, 3)
            
            # プレイヤー2のボードとプレビューを描画
            draw_board(stdscr, game2, 2, 2 + game1.width * 2 + 20)
            draw_preview(stdscr, game2.get_next_pieces(), 2 + game1.width * 2 + 20 + game2.width * 2 + 4, 3)
            
            # 操作方法を表示
            stdscr.addstr(screen_height - 4, 1, "Controls:")
            stdscr.addstr(screen_height - 3, 1, "Player 1: WASD + Space (hard drop)")
            stdscr.addstr(screen_height - 2, 1, "Player 2: IJKL + Enter (hard drop)")
            stdscr.addstr(screen_height - 1, 1, "Press 'q' to quit")
            
            # 自動落下
            current_time = time.time()
            if current_time - last_move_time >= move_interval:
                game1.move(0, 1)
                game2.move(0, 1)
                last_move_time = current_time

            # キー入力の処理
            stdscr.timeout(50)  # 50msのタイムアウト
            key = stdscr.getch()
            
            if key != -1:  # キーが押された場合
                if handle_key_input(key, game1, game2):
                    break

            stdscr.refresh()

    except curses.error:
        pass  # 画面サイズが小さすぎる場合のエラーを無視

    # ゲームオーバー表示
    stdscr.clear()
    if game1.game_over and game2.game_over:
        stdscr.addstr(0, 0, "\nGame Over! It's a tie!")
    elif game1.game_over:
        stdscr.addstr(0, 0, "\nGame Over! Player 2 wins!")
    else:
        stdscr.addstr(0, 0, "\nGame Over! Player 1 wins!")
    stdscr.addstr(1, 0, f"Final Scores - Player 1: {game1.get_score()}, Player 2: {game2.get_score()}")
    stdscr.refresh()
    stdscr.getch()  # キー入力を待つ

def main_wrapper():
    """cursesの初期化と終了を管理"""
    try:
        # Windowsの場合、coloramaを初期化
        if platform.system() == 'Windows':
            init()
        curses.wrapper(main)
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    main_wrapper() 
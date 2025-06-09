import sys
import time
import argparse
from typing import Optional, Dict, Any
import getpass
from pathlib import Path

import curses
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm

from src.game.core import Game, Direction, GameState
from src.utils.logging import app_logger
from src.utils.i18n import get_text


def get_user_inputs() -> Dict[str, Any]:
    """
    対話形式でユーザーから入力を受け取る
    
    Returns:
        Dict[str, Any]: ユーザー入力の辞書
    """
    inputs = {}
    
    # プレイヤー名の入力
    inputs['player_name'] = Prompt.ask(
        get_text("enter_player_name", "en"),
        default="Player"
    )
    
    # 難易度の選択
    difficulty = Prompt.ask(
        get_text("select_difficulty", "en"),
        choices=["easy", "normal", "hard"],
        default="normal"
    )
    inputs['difficulty'] = difficulty
    
    # ゲームモードの選択
    mode = Prompt.ask(
        get_text("select_game_mode", "en"),
        choices=["classic", "time_attack", "puzzle"],
        default="classic"
    )
    inputs['game_mode'] = mode
    
    # カスタム設定の確認
    if Confirm.ask(get_text("custom_settings", "en")):
        inputs['board_size'] = (
            int(Prompt.ask(get_text("board_width", "en"), default="10")),
            int(Prompt.ask(get_text("board_height", "en"), default="10"))
        )
        inputs['time_limit'] = int(Prompt.ask(
            get_text("time_limit", "en"),
            default="300"
        ))
    
    return inputs


class GameDisplay:
    def __init__(self, game: Game, lang: str = "en", config: Optional[Dict[str, Any]] = None):
        """
        ゲーム表示クラスの初期化
        
        Args:
            game (Game): ゲームインスタンス
            lang (str): 言語設定
            config (Optional[Dict[str, Any]]): ゲーム設定
        """
        self.game = game
        self.console = Console()
        self.lang = lang
        self.config = config or {}

    def draw(self):
        """
        ゲーム画面の描画
        """
        try:
            state = self.game.state
            width, height = state.board_size

            # Create empty board
            board = [[" " for _ in range(width)] for _ in range(height)]

            # Place player
            player = state.player_position
            board[player.y][player.x] = "●"

            # Convert board to string
            board_str = "\n".join("".join(row) for row in board)

            # Create game info
            info = get_text("score", self.lang, score=state.score)
            if state.is_game_over:
                info += f"\n{get_text('game_over', self.lang)}"

            # Add player name and difficulty if available
            if self.config.get('player_name'):
                info = f"{get_text('player', self.lang)}: {self.config['player_name']}\n" + info
            if self.config.get('difficulty'):
                info += f"\n{get_text('difficulty', self.lang)}: {self.config['difficulty']}"

            # Create panel
            panel = Panel(
                Text(board_str, style="bold green"),
                title=get_text("welcome", self.lang),
                subtitle=info,
                border_style="blue"
            )

            # Clear screen and draw
            self.console.clear()
            self.console.print(panel)
        except Exception as e:
            app_logger.error(f"Error in draw: {str(e)}")
            raise


def main():
    """
    メイン関数
    コマンドライン引数と対話式入力の両方をサポート
    """
    parser = argparse.ArgumentParser(description=get_text("usage", "en"))
    parser.add_argument("--lang", choices=["en", "ja"], default="en",
                      help="Set language (en/ja)")
    parser.add_argument("--player-name", help="Player name")
    parser.add_argument("--difficulty", choices=["easy", "normal", "hard"],
                      help="Game difficulty")
    parser.add_argument("--mode", choices=["classic", "time_attack", "puzzle"],
                      help="Game mode")
    parser.add_argument("--width", type=int, help="Board width")
    parser.add_argument("--height", type=int, help="Board height")
    parser.add_argument("--time-limit", type=int, help="Time limit in seconds")
    parser.add_argument("--no-interactive", action="store_true",
                      help="Disable interactive mode")
    args = parser.parse_args()

    # 設定の初期化
    config = {}
    
    # コマンドライン引数から設定を取得
    if args.player_name:
        config['player_name'] = args.player_name
    if args.difficulty:
        config['difficulty'] = args.difficulty
    if args.mode:
        config['game_mode'] = args.mode
    if args.width and args.height:
        config['board_size'] = (args.width, args.height)
    if args.time_limit:
        config['time_limit'] = args.time_limit

    # 対話モードが有効な場合、不足している設定を対話で取得
    if not args.no_interactive:
        interactive_inputs = get_user_inputs()
        # コマンドライン引数で指定されていない設定のみ対話入力で上書き
        for key, value in interactive_inputs.items():
            if key not in config:
                config[key] = value

    # Initialize curses
    stdscr = curses.initscr()
    curses.start_color()
    curses.use_default_colors()
    curses.curs_set(0)  # Hide cursor
    stdscr.keypad(1)  # Enable keypad mode
    stdscr.timeout(100)  # Set input timeout

    try:
        game = Game()
        display = GameDisplay(game, args.lang, config)

        # Show help message
        print(get_text("help", args.lang))
        time.sleep(2)

        while True:
            try:
                # Draw game state
                display.draw()

                # Get input
                key = stdscr.getch()
                if key == -1:
                    continue

                # Process input
                if key == ord('q'):
                    break
                elif key == curses.KEY_UP:
                    game.move(Direction.UP)
                elif key == curses.KEY_DOWN:
                    game.move(Direction.DOWN)
                elif key == curses.KEY_LEFT:
                    game.move(Direction.LEFT)
                elif key == curses.KEY_RIGHT:
                    game.move(Direction.RIGHT)
                elif key == ord('r'):
                    game.reset()

                # Check game over
                if game.state.is_game_over:
                    display.draw()
                    time.sleep(2)
                    game.reset()

            except Exception as e:
                app_logger.error(f"Game error: {str(e)}")
                print(get_text("error", args.lang, error=str(e)))
                time.sleep(2)
                game.reset()

    except Exception as e:
        app_logger.error(f"Fatal error: {str(e)}")
        print(get_text("error", args.lang, error=str(e)))
        return 1
    finally:
        # Clean up curses
        curses.endwin()

    return 0


def test_api_connection(api_url):
    try:
        response = requests.get(f"{api_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API server is running")
        else:
            print(f"❌ API server error: {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")


if __name__ == "__main__":
    sys.exit(main())

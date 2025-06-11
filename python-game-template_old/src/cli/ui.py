import os
import sys
import time
import threading
from typing import Optional, Dict, Any, List, Tuple
from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.align import Align
from rich.text import Text
import curses
from rich.prompt import Prompt, Confirm
import curses

from ..game.core import Game, Direction
from ..game.models import GameState, Position, Direction, GameAction, GameConfig, Player
from ..utils.i18n import I18n

# コンソールの設定
console = Console()

# 国際化の設定
i18n = I18n()

class GameUI:
    """ゲームのUIを管理するクラス"""
    
    def __init__(self, game: Game, use_color: bool = True):
        """
        初期化
        
        Args:
            game (Game): ゲームインスタンス
            use_color (bool): カラー表示を使用するかどうか
        """
        self.game = game
        self.use_color = use_color
        self.console = Console(color_system="auto" if use_color else None)
        self.config: Dict[str, Any] = {}
        self.stdscr: Optional[curses.window] = None
        self.game_window: Optional[curses.window] = None
        self.info_window: Optional[curses.window] = None
        self.game_height = 0
        self.game_width = 0
        self.offset_y = 0
        self.offset_x = 0

    def initialize(self) -> None:
        """cursesインターフェースの初期化"""
        self.stdscr = curses.initscr()
        if self.stdscr is None:
            raise RuntimeError("cursesの初期化に失敗しました")
        
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_GREEN, -1)  # 蛇
        curses.init_pair(2, curses.COLOR_RED, -1)    # 食べ物
        curses.init_pair(3, curses.COLOR_YELLOW, -1) # スコア
        curses.curs_set(0)
        self.stdscr.keypad(True)
        self.stdscr.timeout(100)

    def create_windows(self) -> None:
        """ゲームウィンドウの作成と初期化"""
        if self.stdscr is None:
            raise RuntimeError("cursesが初期化されていません")
        
        # 画面サイズを取得
        max_y, max_x = self.stdscr.getmaxyx()
        
        # ゲームウィンドウのサイズを計算（画面の80%）
        self.game_height = int(max_y * 0.8)
        self.game_width = int(max_x * 0.8)
        
        # 中央配置のためのオフセットを計算
        self.offset_y = (max_y - self.game_height) // 2
        self.offset_x = (max_x - self.game_width) // 2
        
        # ゲームウィンドウを作成
        self.game_window = curses.newwin(
            self.game_height,
            self.game_width,
            self.offset_y,
            self.offset_x
        )
        if self.game_window is None:
            raise RuntimeError("ゲームウィンドウの作成に失敗しました")
        
        self.game_window.keypad(True)
        self.game_window.timeout(100)
        
        # 情報ウィンドウを作成
        info_height = 3
        info_width = self.game_width
        info_y = self.offset_y + self.game_height
        info_x = self.offset_x
        
        self.info_window = curses.newwin(
            info_height,
            info_width,
            info_y,
            info_x
        )
        if self.info_window is None:
            raise RuntimeError("情報ウィンドウの作成に失敗しました")

    def draw_border(self) -> None:
        """ゲームウィンドウの境界線を描画"""
        if self.game_window is None:
            raise RuntimeError("ゲームウィンドウが初期化されていません")
        
        self.game_window.border(0)
        self.game_window.refresh()

    def draw_snake(self, state: GameState) -> None:
        """蛇をゲームウィンドウに描画"""
        if self.game_window is None:
            raise RuntimeError("ゲームウィンドウが初期化されていません")
        
        current_player = state.players[state.current_player_id]
        if not current_player.snake_body:
            return

        for segment in current_player.snake_body:
            # ゲームウィンドウに対する相対位置を計算
            y = segment.y + 1  # 境界線の分を加算
            x = segment.x + 1  # 境界線の分を加算
            
            # 位置がゲームウィンドウ内かチェック
            if 0 < y < self.game_height - 1 and 0 < x < self.game_width - 1:
                self.game_window.addch(y, x, '█', curses.color_pair(1))

    def draw_food(self, state: GameState) -> None:
        """食べ物をゲームウィンドウに描画"""
        if self.game_window is None:
            raise RuntimeError("ゲームウィンドウが初期化されていません")
        
        if not state.food_position:
            return

        # ゲームウィンドウに対する相対位置を計算
        y = state.food_position.y + 1  # 境界線の分を加算
        x = state.food_position.x + 1  # 境界線の分を加算
        
        # 位置がゲームウィンドウ内かチェック
        if 0 < y < self.game_height - 1 and 0 < x < self.game_width - 1:
            self.game_window.addch(y, x, '●', curses.color_pair(2))

    def draw_info(self, state: GameState) -> None:
        """ゲーム情報を描画"""
        if self.info_window is None:
            raise RuntimeError("情報ウィンドウが初期化されていません")
        
        if not state:
            return

        current_player = state.players[state.current_player_id]
        self.info_window.clear()
        self.info_window.addstr(0, 0, f"スコア: {current_player.score}")
        self.info_window.addstr(1, 0, f"蛇の長さ: {len(current_player.snake_body)}")
        self.info_window.addstr(2, 0, f"ボードサイズ: {state.board_width}x{state.board_height}")
        self.info_window.refresh()

    def handle_input(self) -> Optional[Direction]:
        """ユーザー入力を処理して方向を返す"""
        if self.game_window is None:
            raise RuntimeError("ゲームウィンドウが初期化されていません")
        
        key = self.game_window.getch()
        
        if key == curses.KEY_UP:
            return Direction.UP
        elif key == curses.KEY_DOWN:
            return Direction.DOWN
        elif key == curses.KEY_LEFT:
            return Direction.LEFT
        elif key == curses.KEY_RIGHT:
            return Direction.RIGHT
        elif key == ord('q'):
            return None
        return None

    def run(self) -> None:
        """メインゲームループ"""
        try:
            self.initialize()
            self.create_windows()
            
            while True:
                if self.game_window is None:
                    raise RuntimeError("ゲームウィンドウが初期化されていません")
                
                self.game_window.clear()
                self.draw_border()
                
                state = self.game.get_state()
                if not state:
                    break
                
                self.draw_snake(state)
                self.draw_food(state)
                self.draw_info(state)
                
                self.game_window.refresh()
                
                direction = self.handle_input()
                if direction is None:
                    break
                
                action = GameAction(player_id=0, action_type="move", direction=direction)
                if not self.game.process_action(action):
                    break
                
                time.sleep(0.1)
                
        finally:
            curses.endwin()

    def display_game_state(self) -> None:
        """ゲーム状態を表示する"""
        try:
            state = self.game.get_state()
            if not state:
                self.console.print("[red]ゲームが初期化されていません[/red]")
                return
            
            # 現在のプレイヤーを取得
            current_player = state.players[state.current_player_id]
            
            # ボードの作成
            board = [[" " for _ in range(state.board_width)] for _ in range(state.board_height)]
            
            # 蛇の描画
            for pos in current_player.snake_body:
                if 0 <= pos.x < state.board_width and 0 <= pos.y < state.board_height:
                    board[pos.y][pos.x] = "■"
            
            # 餌の描画
            if state.food_position:
                if 0 <= state.food_position.x < state.board_width and 0 <= state.food_position.y < state.board_height:
                    board[state.food_position.y][state.food_position.x] = "●"
            
            # ボードの文字列化
            board_str = "\n".join(["".join(row) for row in board])
            
            # ゲーム情報の作成
            info = f"スコア: {current_player.score}"
            if state.game_over:
                info += "\nゲームオーバー"
            
            # プレイヤー名と難易度を追加（設定されている場合）
            if self.config.get("player_name"):
                info = f"プレイヤー: {self.config['player_name']}\n" + info
            if self.config.get("difficulty"):
                info += f"\n難易度: {self.config['difficulty']}"
            
            # パネルの作成
            panel = Panel(
                Text(board_str, style="bold green"),
                title="スネークゲーム",
                subtitle=info,
                border_style="blue"
            )
            
            # パネルの表示
            self.console.print(panel)
            
        except Exception as e:
            self.console.print(f"[red]描画中にエラーが発生しました: {str(e)}[/red]")
            raise
    
    def get_input(self) -> str:
        """
        ユーザー入力を取得する
        
        Returns:
            str: 入力されたキー
        """
        return Prompt.ask("移動方向を入力してください (w/a/s/d/q: 終了)")
    
    def get_direction(self, key: str) -> Optional[Direction]:
        """
        キーから方向を取得する
        
        Args:
            key (str): 入力されたキー
            
        Returns:
            Optional[Direction]: 方向（無効な場合はNone）
        """
        key = key.lower()
        if key == "w":
            return Direction.UP
        elif key == "s":
            return Direction.DOWN
        elif key == "a":
            return Direction.LEFT
        elif key == "d":
            return Direction.RIGHT
        return None
    
    def display_game_over(self) -> None:
        """ゲームオーバー画面を表示する"""
        state = self.game.get_state()
        if not state:
            return
        
        current_player = state.players[state.current_player_id]
        
        # ゲームオーバーメッセージの作成
        message = f"""
        ゲームオーバー！
        
        最終スコア: {current_player.score}
        プレイ時間: {state.tick_count} ティック
        
        お疲れ様でした！
        """
        
        # パネルの作成
        panel = Panel(
            Text(message, style="bold red"),
            title="ゲームオーバー",
            border_style="red"
        )
        
        # パネルの表示
        self.console.print(panel)
    
    def set_config(self, config: Dict[str, Any]) -> None:
        """
        設定を更新する
        
        Args:
            config (Dict[str, Any]): 新しい設定
        """
        self.config.update(config)


def start_game() -> None:
    """Start the game with CLI interface"""
    game = Game()
    game.initialize_game("CLI Player")
    ui = GameUI(game)
    ui.run()


def main():
    """Main entry point for CLI interface"""
    start_game()


if __name__ == "__main__":
    main()

import os
import sys
import time
import threading
from typing import Optional
from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.align import Align
from rich.text import Text
import keyboard

from ..game.core import SnakeGame
from ..game.models import GameConfig, GameState, GameBoard, GameAction, Direction, CellType


class TerminalUI:
    def __init__(self):
        self.console = Console()
        self.game: Optional[SnakeGame] = None
        self.running = False
        self.last_input: Optional[str] = None
        self.input_thread: Optional[threading.Thread] = None

    def start_game(self):
        """Start the Snake game in terminal UI"""
        # Clear screen
        self.console.clear()

        # Initialize game
        config = GameConfig(board_width=25, board_height=15, game_name="Terminal Snake", tick_speed=0.15)

        self.game = SnakeGame(config)
        self.game.initialize_game("Terminal Player")
        self.game.set_render_callback(self._render_game)

        self.running = True

        # Start input handling in separate thread
        self.input_thread = threading.Thread(target=self._input_handler, daemon=True)
        self.input_thread.start()

        # Show instructions
        self._show_instructions()
        time.sleep(2)

        # Game loop with live rendering
        try:
            with Live(self._create_game_display(), console=self.console, refresh_per_second=8) as live:
                while self.running and not self.game.is_game_over():
                    # Process input
                    if self.last_input:
                        direction = self._parse_input(self.last_input)
                        if direction:
                            action = GameAction(player_id=0, action_type="move", direction=direction)
                            self.game.process_action(action)
                        elif self.last_input == "q":
                            self.running = False
                        elif self.last_input == "r":
                            self.game.initialize_game("Terminal Player")

                        self.last_input = None

                    # Auto-move if no input
                    if not self.game.is_game_over():
                        if self.game.state:
                            player = self.game.state.players[0]
                            action = GameAction(player_id=0, action_type="move", direction=player.direction)
                            self.game.process_action(action)

                    # Update display
                    live.update(self._create_game_display())
                    time.sleep(self.game.config.tick_speed)

                # Game over screen
                live.update(self._create_game_over_display())

        except KeyboardInterrupt:
            pass
        finally:
            self.running = False

    def _input_handler(self):
        """Handle keyboard input in separate thread"""
        try:
            while self.running:
                if keyboard.is_pressed("up") or keyboard.is_pressed("w"):
                    self.last_input = "up"
                    time.sleep(0.1)
                elif keyboard.is_pressed("down") or keyboard.is_pressed("s"):
                    self.last_input = "down"
                    time.sleep(0.1)
                elif keyboard.is_pressed("left") or keyboard.is_pressed("a"):
                    self.last_input = "left"
                    time.sleep(0.1)
                elif keyboard.is_pressed("right") or keyboard.is_pressed("d"):
                    self.last_input = "right"
                    time.sleep(0.1)
                elif keyboard.is_pressed("q"):
                    self.last_input = "q"
                    time.sleep(0.1)
                elif keyboard.is_pressed("r"):
                    self.last_input = "r"
                    time.sleep(0.1)

                time.sleep(0.05)  # Small delay to prevent excessive CPU usage

        except Exception as e:
            # Fallback to simple input if keyboard module fails
            self._simple_input_handler()

    def _simple_input_handler(self):
        """Simple input handler as fallback"""
        import select
        import sys

        while self.running:
            try:
                # Non-blocking input check (Unix-like systems)
                if hasattr(select, "select"):
                    if select.select([sys.stdin], [], [], 0.1) == ([sys.stdin], [], []):
                        key = sys.stdin.read(1)
                        if key in ["w", "a", "s", "d"]:
                            direction_map = {"w": "up", "a": "left", "s": "down", "d": "right"}
                            self.last_input = direction_map[key]
                        elif key == "q":
                            self.last_input = "q"
                        elif key == "r":
                            self.last_input = "r"
                else:
                    # For Windows or systems without select
                    time.sleep(0.1)

            except Exception:
                time.sleep(0.1)

    def _parse_input(self, input_str: str) -> Optional[Direction]:
        """Parse input string to direction"""
        direction_map = {"up": Direction.UP, "down": Direction.DOWN, "left": Direction.LEFT, "right": Direction.RIGHT}
        return direction_map.get(input_str)

    def _show_instructions(self):
        """Show game instructions"""
        instructions = Panel(
            Text.from_markup(
                "[bold cyan]🐍 Terminal Snake Game 🐍[/bold cyan]\n\n"
                "[yellow]Controls:[/yellow]\n"
                "• Arrow Keys or WASD - Move snake\n"
                "• Q - Quit game\n"
                "• R - Restart game\n\n"
                "[green]Goal:[/green] Eat food (●) to grow and increase score!\n"
                "[red]Avoid:[/red] Hitting walls or yourself!\n\n"
                "[dim]Starting in 2 seconds...[/dim]"
            ),
            title="Welcome",
            border_style="bright_blue",
        )

        self.console.print(Align.center(instructions))

    def _create_game_display(self) -> Panel:
        """Create the main game display"""
        if not self.game or not self.game.state or not self.game.board:
            return Panel("Game not initialized", title="Error")

        # Create game board display
        board_content = self._render_board()

        # Create info panel
        player = self.game.state.players[0]
        info_content = f"[bold green]Score:[/bold green] {player.score}\n"
        info_content += f"[bold blue]Length:[/bold blue] {len(player.snake_body)}\n"
        info_content += f"[bold yellow]Direction:[/bold yellow] {player.direction.value.upper()}"

        # Combine board and info
        table = Table.grid(padding=1)
        table.add_column()
        table.add_column()

        table.add_row(
            Panel(board_content, title="Game Board", border_style="green"),
            Panel(info_content, title="Stats", border_style="blue"),
        )

        return Panel(table, title=f"🐍 {self.game.config.game_name} 🐍", border_style="bright_magenta")

    def _create_game_over_display(self) -> Panel:
        """Create game over display"""
        if not self.game or not self.game.state:
            return Panel("Game Over", title="Game Over")

        player = self.game.state.players[0]

        game_over_text = Text.from_markup(
            f"[bold red]🎮 GAME OVER! 🎮[/bold red]\n\n"
            f"[yellow]Final Score:[/yellow] [bold green]{player.score}[/bold green]\n"
            f"[yellow]Snake Length:[/yellow] [bold blue]{len(player.snake_body)}[/bold blue]\n\n"
            f"[dim]Press 'r' to restart or 'q' to quit[/dim]"
        )

        return Panel(Align.center(game_over_text), title="Game Over", border_style="red")

    def _render_board(self) -> str:
        """Render the game board as a string"""
        if not self.game or not self.game.board:
            return "No board"

        board = self.game.board
        result = ""

        # Top border
        result += "┌" + "─" * (board.width * 2) + "┐\n"

        # Board content
        for y in range(board.height):
            result += "│"
            for x in range(board.width):
                cell = board.cells[y][x]
                if cell == CellType.SNAKE:
                    # Check if this is the head (first position in snake_body)
                    if (
                        self.game.state
                        and self.game.state.players[0].snake_body
                        and self.game.state.players[0].snake_body[0].x == x
                        and self.game.state.players[0].snake_body[0].y == y
                    ):
                        result += "🟢"  # Snake head
                    else:
                        result += "🟩"  # Snake body
                elif cell == CellType.FOOD:
                    result += "🍎"  # Food
                else:
                    result += "  "  # Empty space
            result += "│\n"

        # Bottom border
        result += "└" + "─" * (board.width * 2) + "┘"

        return result

    def _render_game(self, state: GameState, board: GameBoard):
        """Callback function for game rendering (used by game engine)"""
        # This is handled by the Live display, so we don't need to do anything here
        pass


def main():
    """Main entry point for CLI interface"""
    ui = TerminalUI()
    try:
        ui.start_game()
    except Exception as e:
        print(f"Error running game: {e}")
        print("Make sure you have the required dependencies installed:")
        print("pip install rich keyboard")


if __name__ == "__main__":
    main()

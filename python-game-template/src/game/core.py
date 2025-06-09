import random
import time
from typing import Optional, Callable, Dict, Any, List, Tuple
from .models import GameState, GameConfig, Player, Position, Direction, CellType, GameBoard, GameAction
from dataclasses import dataclass
from enum import Enum


class Direction(Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"


@dataclass
class Position:
    x: int
    y: int

    def move(self, direction: Direction) -> "Position":
        if direction == Direction.UP:
            return Position(self.x, self.y - 1)
        elif direction == Direction.DOWN:
            return Position(self.x, self.y + 1)
        elif direction == Direction.LEFT:
            return Position(self.x - 1, self.y)
        elif direction == Direction.RIGHT:
            return Position(self.x + 1, self.y)
        return self


@dataclass
class GameState:
    player_position: Position
    score: int
    is_game_over: bool
    board_size: Tuple[int, int]

    @classmethod
    def create_new(cls, board_size: Tuple[int, int] = (10, 10)) -> "GameState":
        return cls(
            player_position=Position(board_size[0] // 2, board_size[1] // 2),
            score=0,
            is_game_over=False,
            board_size=board_size,
        )


class SnakeGame:
    def __init__(self, config: GameConfig):
        self.config = config
        self.state: Optional[GameState] = None
        self.board: Optional[GameBoard] = None
        self.render_callback: Optional[Callable[[GameState, GameBoard], None]] = None
        self.input_callback: Optional[Callable[[], Optional[str]]] = None

    def initialize_game(self, player_name: str = "Player 1") -> GameState:
        """Initialize a new game with the specified player"""
        # Create player with initial snake position
        initial_snake = [
            Position(x=self.config.board_width // 2, y=self.config.board_height // 2),
            Position(x=self.config.board_width // 2 - 1, y=self.config.board_height // 2),
            Position(x=self.config.board_width // 2 - 2, y=self.config.board_height // 2),
        ]

        player = Player(id=0, name=player_name, score=0, snake_body=initial_snake, direction=Direction.RIGHT)

        # Create game state
        self.state = GameState(
            player_position=initial_snake[0],
            score=0,
            is_game_over=False,
            board_size=(self.config.board_width, self.config.board_height),
        )

        # Create board
        self.board = self._create_board()
        self._update_board()

        return self.state

    def _create_board(self) -> GameBoard:
        """Create an empty game board"""
        cells = [[CellType.EMPTY for _ in range(self.config.board_width)] for _ in range(self.config.board_height)]
        return GameBoard(width=self.config.board_width, height=self.config.board_height, cells=cells)

    def _update_board(self):
        """Update the board based on current game state"""
        if not self.state or not self.board:
            return

        # Clear board
        for y in range(self.board.height):
            for x in range(self.board.width):
                self.board.cells[y][x] = CellType.EMPTY

        # Place snake
        player = self.state.player_position
        if 0 <= player.x < self.board.width and 0 <= player.y < self.board.height:
            self.board.cells[player.y][player.x] = CellType.SNAKE

        # Place food
        if self.state.food_position:
            food_pos = self.state.food_position
            if 0 <= food_pos.x < self.board.width and 0 <= food_pos.y < self.board.height:
                self.board.cells[food_pos.y][food_pos.x] = CellType.FOOD

    def _generate_food_position(self, snake_body: list[Position]) -> Position:
        """Generate a random food position that doesn't overlap with snake"""
        while True:
            pos = Position(
                x=random.randint(0, self.config.board_width - 1), y=random.randint(0, self.config.board_height - 1)
            )
            if pos not in snake_body:
                return pos

    def process_action(self, action: GameAction) -> bool:
        """Process a game action and return True if game should continue"""
        if not self.state:
            return False

        if action.action_type == "move" and action.direction:
            return self._move_snake(action.direction)
        elif action.action_type == "restart":
            self.initialize_game()
            return True

        return True

    def _move_snake(self, direction: Direction) -> bool:
        """Move the snake in the specified direction"""
        if not self.state:
            return False

        new_position = self.state.player_position.move(direction)
        
        # Check boundaries
        if (0 <= new_position.x < self.config.board_width and
            0 <= new_position.y < self.config.board_height):
            self.state.player_position = new_position
            self.state.score += 1

        # Check collision with walls
        if (
            new_position.x < 0
            or new_position.x >= self.config.board_width
            or new_position.y < 0
            or new_position.y >= self.config.board_height
        ):
            self.state.is_game_over = True
            return False

        # Check collision with self
        if new_position in self.state.snake_body:
            self.state.is_game_over = True
            return False

        # Add new head
        self.state.snake_body.insert(0, new_position)

        # Check if food was eaten
        if new_position == self.state.food_position:
            self.state.score += 10
            self.state.food_position = self._generate_food_position(self.state.snake_body)
        else:
            # Remove tail if no food eaten
            self.state.snake_body.pop()

        self.state.tick_count += 1
        self._update_board()
        return True

    def get_state(self) -> Optional[GameState]:
        """Get current game state"""
        return self.state

    def get_board(self) -> Optional[GameBoard]:
        """Get current game board"""
        return self.board

    def is_game_over(self) -> bool:
        """Check if game is over"""
        return self.state.is_game_over if self.state else True

    def set_render_callback(self, callback: Callable[[GameState, GameBoard], None]):
        """Set callback function for rendering"""
        self.render_callback = callback

    def set_input_callback(self, callback: Callable[[], Optional[str]]):
        """Set callback function for input"""
        self.input_callback = callback

    def render(self):
        """Render the game using the callback"""
        if self.render_callback and self.state and self.board:
            self.render_callback(self.state, self.board)


# Backward compatibility
class Game(SnakeGame):
    def __init__(self):
        config = GameConfig()
        super().__init__(config)

    def start(self):
        self.initialize_game()
        self.run_game_loop()

    def run_game_loop(self):
        while not self.is_game_over():
            # Basic game loop - should be overridden by CLI/Web implementations
            time.sleep(self.config.tick_speed)
            # Auto-move snake forward
            if self.state:
                player = self.state.player_position
                action = GameAction(player_id=0, action_type="move", direction=player.direction)
                if not self.process_action(action):
                    break
            self.render()

    def update(self):
        # Legacy method - now handled by process_action
        pass

    def check_game_over(self):
        return self.is_game_over()

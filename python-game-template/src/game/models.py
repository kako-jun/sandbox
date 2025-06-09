from pydantic import BaseModel
from typing import List, Optional, Tuple
from enum import Enum


class Direction(str, Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"


class CellType(str, Enum):
    EMPTY = "empty"
    SNAKE = "snake"
    FOOD = "food"
    WALL = "wall"


class Position(BaseModel):
    x: int
    y: int


class Player(BaseModel):
    id: int
    name: str
    score: int
    snake_body: List[Position] = []
    direction: Direction = Direction.RIGHT


class GameState(BaseModel):
    players: List[Player]
    current_player_id: int = 0
    game_over: bool = False
    winner: Optional[Player] = None
    food_position: Optional[Position] = None
    board_width: int = 20
    board_height: int = 15
    tick_count: int = 0


class GameConfig(BaseModel):
    max_players: int = 1
    board_width: int = 20
    board_height: int = 15
    game_name: str = "Snake Game"
    tick_speed: float = 0.2


class GameAction(BaseModel):
    player_id: int
    action_type: str  # "move", "start", "restart"
    direction: Optional[Direction] = None


class GameBoard(BaseModel):
    width: int
    height: int
    cells: List[List[CellType]]

    def get_cell(self, pos: Position) -> CellType:
        if 0 <= pos.x < self.width and 0 <= pos.y < self.height:
            return self.cells[pos.y][pos.x]
        return CellType.WALL

    def set_cell(self, pos: Position, cell_type: CellType):
        if 0 <= pos.x < self.width and 0 <= pos.y < self.height:
            self.cells[pos.y][pos.x] = cell_type

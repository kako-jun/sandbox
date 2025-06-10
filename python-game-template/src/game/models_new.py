from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from enum import Enum


class Direction(str, Enum):
    """移動方向を表す列挙型"""

    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"


class CellType(str, Enum):
    EMPTY = "empty"
    SNAKE = "snake"
    FOOD = "food"
    WALL = "wall"


class GameMode(str, Enum):
    """ゲームモードを表す列挙型"""

    CLASSIC = "classic"
    TIME_ATTACK = "time_attack"
    SURVIVAL = "survival"
    PUZZLE = "puzzle"


class Difficulty(str, Enum):
    """難易度を表す列挙型"""

    EASY = "easy"
    NORMAL = "normal"
    HARD = "hard"


class Position(BaseModel):
    """位置を表すモデル"""

    x: int = Field(ge=0)
    y: int = Field(ge=0)


class GameConfig(BaseModel):
    """ゲームの設定を表すモデル"""

    width: int = Field(default=20, ge=10, le=50)
    height: int = Field(default=20, ge=10, le=50)
    initial_speed: float = Field(default=1.0, ge=0.1, le=5.0)
    speed_increase: float = Field(default=0.1, ge=0.0, le=1.0)
    food_value: int = Field(default=10, ge=1, le=100)
    time_limit: int = Field(default=300, ge=60, le=3600)
    difficulty: Difficulty = Difficulty.NORMAL
    game_mode: GameMode = GameMode.CLASSIC

    @field_validator("width", "height")
    @classmethod
    def validate_board_size(cls, v):
        if v < 10:
            raise ValueError("ボードサイズは10以上である必要があります")
        return v

    @field_validator("time_limit")
    @classmethod
    def validate_time_limit(cls, v):
        if v < 60:
            raise ValueError("制限時間は60秒以上である必要があります")
        return v


class Player(BaseModel):
    """プレイヤーを表すモデル"""

    id: str
    name: str
    score: int = 0
    position: Position
    direction: Direction = Direction.RIGHT
    is_alive: bool = True
    snake_body: List[Position] = Field(default_factory=list)  # SnakeGameで使用

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v:
            raise ValueError("プレイヤー名は空にできません")
        return v


class GameState(BaseModel):
    """ゲーム状態を表すモデル"""

    config: GameConfig
    snake: List[Position]
    food: Position
    score: int = Field(default=0, ge=0)
    game_over: bool = Field(default=False)
    time_remaining: int = Field(default=300, ge=0)
    current_direction: Direction = Field(default=Direction.RIGHT)

    # SnakeGameクラスで使用される追加フィールド（オプション）
    players: Optional[Dict[int, Player]] = None
    current_player_id: Optional[int] = None
    food_position: Optional[Position] = None
    board_width: Optional[int] = None
    board_height: Optional[int] = None
    tick_count: Optional[int] = None
    difficulty: Optional[Difficulty] = None
    game_mode: Optional[GameMode] = None

    @field_validator("snake")
    @classmethod
    def validate_snake(cls, v: List[Position]) -> List[Position]:
        """蛇の位置が有効かチェック"""
        if not v:
            raise ValueError("Snake must have at least one segment")

        # 蛇の体が重なっていないかチェック
        positions = set()
        for pos in v:
            if (pos.x, pos.y) in positions:
                raise ValueError("Snake segments cannot overlap")
            positions.add((pos.x, pos.y))

        return v

    @field_validator("food")
    @classmethod
    def validate_food(cls, v: Position, info) -> Position:
        """食べ物の位置が有効かチェック"""
        # info.data を使用して他のフィールドにアクセス
        if "snake" in info.data:
            # 食べ物が蛇の体と重なっていないかチェック
            for pos in info.data["snake"]:
                if pos.x == v.x and pos.y == v.y:
                    raise ValueError("Food cannot overlap with snake")

        # 食べ物がボード内にあるかチェック
        if "config" in info.data:
            if v.x >= info.data["config"].width or v.y >= info.data["config"].height:
                raise ValueError("Food must be within board boundaries")

        return v


class GameAction(BaseModel):
    """ゲームアクションを表すモデル"""

    player_id: str
    action_type: str
    direction: Optional[Direction] = None

    @field_validator("player_id")
    @classmethod
    def validate_player_id(cls, v):
        if not v:
            raise ValueError("プレイヤーIDは空にできません")
        return v


class GameBoard(BaseModel):
    """ゲームボードを表すモデル"""

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

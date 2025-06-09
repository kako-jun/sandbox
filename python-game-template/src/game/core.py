import random
import logging
import time
from typing import Optional, Callable, Dict, Any, List, Tuple, Sequence
from .models import GameState, GameConfig, Player, Position, Direction, CellType, GameBoard, GameAction, Difficulty, GameMode

# ロガーの設定
logger = logging.getLogger(__name__)


class SnakeGame:
    def __init__(self, config: Optional[GameConfig] = None):
        """
        スネークゲームの初期化
        
        Args:
            config (Optional[GameConfig]): ゲームの設定
        """
        self.config = config or GameConfig()
        self.state: Optional[GameState] = None
        self.board: Optional[GameBoard] = None
        self.render_callback: Optional[Callable[[GameState, GameBoard], None]] = None
        self.input_callback: Optional[Callable[[], Optional[str]]] = None
        self.start_time: Optional[float] = None

    def initialize_game(self, player_name: str = "Player 1", config: Optional[GameConfig] = None) -> Optional[GameState]:
        """
        指定されたプレイヤーで新しいゲームを初期化
        
        Args:
            player_name (str): プレイヤー名
            config (Optional[GameConfig]): ゲームの設定
            
        Returns:
            Optional[GameState]: 初期化されたゲーム状態
        """
        if config:
            self.config = config

        # 初期の蛇の位置でプレイヤーを作成
        initial_snake = [
            Position(x=self.config.width // 2, y=self.config.height // 2),
            Position(x=self.config.width // 2 - 1, y=self.config.height // 2),
            Position(x=self.config.width // 2 - 2, y=self.config.height // 2),
        ]

        player = Player(
            id=0,
            name=player_name,
            score=0,
            snake_body=initial_snake,
            direction=Direction.RIGHT
        )

        # ゲーム状態を作成
        self.state = GameState(
            players={0: player},
            current_player_id=0,
            game_over=False,
            food_position=self._generate_food_position(initial_snake),
            board_width=self.config.width,
            board_height=self.config.height,
            tick_count=0,
            difficulty=self.config.difficulty,
            game_mode=self.config.game_mode
        )

        # ボードを作成
        self.board = self._create_board()
        self._update_board()

        return self.state

    def configure(self, config: GameConfig) -> Optional[GameState]:
        """
        ゲームの設定を更新
        
        Args:
            config (GameConfig): 新しいゲーム設定
            
        Returns:
            Optional[GameState]: 更新されたゲーム状態
        """
        self.config = config
        if self.state:
            self.state.board_width = config.width
            self.state.board_height = config.height
            self.state.difficulty = config.difficulty
            self.state.game_mode = config.game_mode
            self.board = self._create_board()
            self._update_board()
        return self.state

    def tick(self) -> Optional[GameState]:
        """
        ゲームの1ティックを進める
        
        Returns:
            Optional[GameState]: 更新されたゲーム状態
        """
        if not self.state or self.state.game_over:
            return None

        current_player = self.state.players[self.state.current_player_id]
        if current_player.direction:
            return self._move_snake(current_player.direction)
        return None

    def _create_board(self) -> GameBoard:
        """
        空のゲームボードを作成
        
        Returns:
            GameBoard: 作成されたボード
        """
        cells = [[CellType.EMPTY for _ in range(self.config.width)] for _ in range(self.config.height)]
        return GameBoard(width=self.config.width, height=self.config.height, cells=cells)

    def _update_board(self) -> None:
        """
        ゲームボードを更新
        """
        if not self.state or not self.board:
            return

        # ボードをクリア
        for y in range(self.board.height):
            for x in range(self.board.width):
                self.board.cells[y][x] = CellType.EMPTY

        # 蛇の位置を更新
        for player in self.state.players.values():
            for pos in player.snake_body:
                if 0 <= pos.x < self.board.width and 0 <= pos.y < self.board.height:
                    self.board.cells[pos.y][pos.x] = CellType.SNAKE

        # 食べ物の位置を更新
        if self.state.food_position:
            if (0 <= self.state.food_position.x < self.board.width and
                0 <= self.state.food_position.y < self.board.height):
                self.board.cells[self.state.food_position.y][self.state.food_position.x] = CellType.FOOD

        # 描画コールバックがあれば呼び出し
        if self.render_callback and self.state and self.board:
            self.render_callback(self.state, self.board)

    def _generate_food_position(self, snake_body: List[Position]) -> Optional[Position]:
        """
        食べ物の位置を生成
        
        Args:
            snake_body (List[Position]): 蛇の体の位置リスト
            
        Returns:
            Optional[Position]: 生成された食べ物の位置
        """
        if not self.state:
            return None

        available_positions = []
        for y in range(self.state.board_height):
            for x in range(self.state.board_width):
                pos = Position(x=x, y=y)
                if pos not in snake_body:
                    available_positions.append(pos)

        if not available_positions:
            return None

        return random.choice(available_positions)

    def get_state(self) -> Optional[GameState]:
        """
        現在のゲーム状態を取得
        
        Returns:
            Optional[GameState]: 現在のゲーム状態
        """
        return self.state

    def get_board(self) -> Optional[GameBoard]:
        """
        現在のゲームボードを取得
        
        Returns:
            Optional[GameBoard]: 現在のゲームボード
        """
        return self.board

    def is_game_over(self) -> bool:
        """
        ゲームが終了したかどうかをチェック
        
        Returns:
            bool: ゲームが終了している場合はTrue
        """
        return self.state.game_over if self.state else True

    def set_render_callback(self, callback: Callable[[GameState, GameBoard], None]):
        """
        描画用のコールバック関数を設定
        
        Args:
            callback (Callable[[GameState, GameBoard], None]): 描画用のコールバック関数
        """
        self.render_callback = callback

    def set_input_callback(self, callback: Callable[[], Optional[str]]):
        """
        入力用のコールバック関数を設定
        
        Args:
            callback (Callable[[], Optional[str]]): 入力用のコールバック関数
        """
        self.input_callback = callback

    def render(self):
        """コールバック関数を使用してゲームを描画"""
        if self.render_callback and self.state and self.board:
            self.render_callback(self.state, self.board)

    def reset(self) -> Optional[GameState]:
        """
        ゲームをリセット
        
        Returns:
            Optional[GameState]: リセットされたゲーム状態
        """
        return self.initialize_game()

    def _move_snake(self, direction: Direction) -> Optional[GameState]:
        """
        蛇を指定された方向に移動
        
        Args:
            direction (Direction): 移動方向
            
        Returns:
            Optional[GameState]: 更新されたゲーム状態
        """
        if not self.state:
            return None

        current_player = self.state.players[self.state.current_player_id]
        head = current_player.snake_body[0]
        new_head = Position(
            x=head.x + (1 if direction == Direction.RIGHT else -1 if direction == Direction.LEFT else 0),
            y=head.y + (1 if direction == Direction.DOWN else -1 if direction == Direction.UP else 0)
        )

        # 壁との衝突チェック
        if (new_head.x < 0 or new_head.x >= self.state.board_width or
            new_head.y < 0 or new_head.y >= self.state.board_height):
            self.state.game_over = True
            return None

        # 自身との衝突チェック
        if new_head in current_player.snake_body:
            self.state.game_over = True
            return None

        # 新しい頭を追加
        current_player.snake_body.insert(0, new_head)

        # 食べ物との衝突チェック
        if self.state.food_position and new_head == self.state.food_position:
            current_player.score += 1
            self.state.food_position = self._generate_food_position(current_player.snake_body)
        else:
            # 食べ物を食べていない場合は尾を削除
            current_player.snake_body.pop()

        self.state.tick_count += 1
        self._update_board()
        return self.state

    def process_action(self, action: GameAction) -> bool:
        """
        ゲームアクションを処理
        
        Args:
            action (GameAction): 処理するアクション
            
        Returns:
            bool: 処理が成功したかどうか
        """
        if not self.state or self.state.game_over:
            return False

        if action.player_id not in self.state.players:
            return False

        if action.action_type == "move" and action.direction:
            self.state.players[action.player_id].direction = action.direction
            return True
        elif action.action_type == "restart":
            self.initialize_game()
            return True

        return False


class Game:
    """ゲームの基本クラス"""
    def __init__(self, config: GameConfig):
        self.config = config
        self.state: Optional[GameState] = None
        self.start_time: float = 0
        self.last_tick_time: float = 0

    def initialize_game(self, player_name: str) -> Optional[GameState]:
        """ゲームを初期化する"""
        # 初期位置を設定
        initial_position = Position(
            x=self.config.width // 2,
            y=self.config.height // 2
        )

        # ゲーム状態を初期化
        self.state = GameState(
            config=self.config,
            snake=[initial_position],
            food=self._generate_food(),
            score=0,
            game_over=False,
            time_remaining=self.config.time_limit,
            current_direction=Direction.RIGHT
        )

        self.start_time = time.time()
        self.last_tick_time = self.start_time
        return self.state

    def _generate_food(self) -> Position:
        """食べ物の位置を生成する"""
        while True:
            x = random.randint(0, self.config.width - 1)
            y = random.randint(0, self.config.height - 1)
            position = Position(x=x, y=y)
            
            # 蛇の体と重ならないようにする
            if self.state and position not in self.state.snake:
                return position

    def move(self, direction: Direction) -> bool:
        """蛇を移動させる"""
        if not self.state or self.state.game_over:
            return False

        # 現在の方向と逆方向への移動は無効
        if self.state.current_direction == Direction.UP and direction == Direction.DOWN:
            return False
        if self.state.current_direction == Direction.DOWN and direction == Direction.UP:
            return False
        if self.state.current_direction == Direction.LEFT and direction == Direction.RIGHT:
            return False
        if self.state.current_direction == Direction.RIGHT and direction == Direction.LEFT:
            return False

        # 新しい頭の位置を計算
        head = self.state.snake[0]
        new_head = Position(
            x=head.x + (1 if direction == Direction.RIGHT else -1 if direction == Direction.LEFT else 0),
            y=head.y + (1 if direction == Direction.DOWN else -1 if direction == Direction.UP else 0)
        )

        # 壁との衝突チェック
        if (new_head.x < 0 or new_head.x >= self.config.width or
            new_head.y < 0 or new_head.y >= self.config.height):
            self.state.game_over = True
            return False

        # 自身との衝突チェック
        if new_head in self.state.snake:
            self.state.game_over = True
            return False

        # 蛇を移動
        self.state.snake.insert(0, new_head)
        self.state.current_direction = direction

        # 食べ物との衝突チェック
        if new_head == self.state.food:
            self.state.score += self.config.food_value
            self.state.food = self._generate_food()
        else:
            self.state.snake.pop()

        return True

    def tick(self) -> Optional[GameState]:
        """ゲームの状態を更新する"""
        if not self.state or self.state.game_over:
            return None

        current_time = time.time()
        elapsed_time = current_time - self.last_tick_time
        self.last_tick_time = current_time

        # 時間制限のチェック
        total_elapsed = current_time - self.start_time
        self.state.time_remaining = max(0, self.config.time_limit - int(total_elapsed))
        if self.state.time_remaining <= 0:
            self.state.game_over = True
            return self.state

        return self.state

    def get_state(self) -> Optional[GameState]:
        """現在のゲーム状態を取得する"""
        return self.state

    def reset(self) -> Optional[GameState]:
        """ゲームをリセットする"""
        if not self.state:
            return None

        # 初期位置を設定
        initial_position = Position(
            x=self.config.width // 2,
            y=self.config.height // 2
        )

        # ゲーム状態をリセット
        self.state = GameState(
            config=self.config,
            snake=[initial_position],
            food=self._generate_food(),
            score=0,
            game_over=False,
            time_remaining=self.config.time_limit,
            current_direction=Direction.RIGHT
        )

        self.start_time = time.time()
        self.last_tick_time = self.start_time
        return self.state

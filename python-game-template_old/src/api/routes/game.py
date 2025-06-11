from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from ...game.core import Game
from ...game.models import GameConfig, Direction, Difficulty, GameMode

# ルーターの作成
router = APIRouter()

# ゲームインスタンスの初期化
# 必ずGameConfigを渡す
initial_config = GameConfig()
game = Game(initial_config)
game.initialize_game("API Player")  # デフォルトのプレイヤー名で初期化


class PositionResponse(BaseModel):
    """位置情報のレスポンスモデル"""

    x: int
    y: int


class BoardSizeResponse(BaseModel):
    """ボードサイズのレスポンスモデル"""

    width: int
    height: int


class GameStateResponse(BaseModel):
    """ゲーム状態のレスポンスモデル"""

    player_position: Optional[PositionResponse]
    score: int
    is_game_over: bool
    board_size: Optional[BoardSizeResponse]
    food_position: Optional[PositionResponse]
    snake_body: List[PositionResponse]
    tick_count: int


class MoveRequest(BaseModel):
    """移動リクエストのモデル"""

    direction: Direction


class GameConfigRequest(BaseModel):
    """ゲーム設定のリクエストモデル"""

    board_width: Optional[int] = None
    board_height: Optional[int] = None
    difficulty: Optional[str] = None
    game_mode: Optional[str] = None
    time_limit: Optional[int] = None


@router.get("/state", response_model=GameStateResponse)
async def get_game_state() -> GameStateResponse:
    """
    現在のゲーム状態を取得

    Returns:
        GameStateResponse: 現在のゲーム状態

    Raises:
        HTTPException: ゲームが初期化されていない場合
    """
    state = game.get_state()
    if not state:
        raise HTTPException(status_code=404, detail="ゲームが初期化されていません")
    current_player = state.snake[0] if hasattr(state, "snake") else None
    return GameStateResponse(
        player_position=PositionResponse(x=current_player.x, y=current_player.y) if current_player else None,
        score=state.score,
        is_game_over=state.game_over,
        board_size=BoardSizeResponse(width=state.config.width, height=state.config.height) if state.config else None,
        food_position=PositionResponse(x=state.food.x, y=state.food.y) if state.food else None,
        snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in state.snake] if hasattr(state, "snake") else [],
        tick_count=getattr(state, "tick_count", 0) or 0,
    )


@router.post("/move", response_model=GameStateResponse)
async def move_snake(request: MoveRequest) -> GameStateResponse:
    """
    蛇を移動させる

    Args:
        request (MoveRequest): 移動方向を含むリクエスト

    Returns:
        GameStateResponse: 更新されたゲーム状態

    Raises:
        HTTPException: ゲームが初期化されていない場合、または無効な移動の場合
    """
    state = game.get_state()
    if not state:
        raise HTTPException(status_code=404, detail="ゲームが初期化されていません")
    if not game.move(request.direction):
        raise HTTPException(status_code=400, detail="無効な移動です")
    current_player = state.snake[0] if hasattr(state, "snake") else None
    return GameStateResponse(
        player_position=PositionResponse(x=current_player.x, y=current_player.y) if current_player else None,
        score=state.score,
        is_game_over=state.game_over,
        board_size=BoardSizeResponse(width=state.config.width, height=state.config.height) if state.config else None,
        food_position=PositionResponse(x=state.food.x, y=state.food.y) if state.food else None,
        snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in state.snake] if hasattr(state, "snake") else [],
        tick_count=getattr(state, "tick_count", 0) or 0,
    )


@router.post("/reset", response_model=GameStateResponse)
async def reset_game() -> GameStateResponse:
    """
    ゲームをリセットする

    Returns:
        GameStateResponse: リセットされたゲーム状態

    Raises:
        HTTPException: ゲームのリセットに失敗した場合
    """
    state = game.reset()
    if not state:
        raise HTTPException(status_code=500, detail="ゲームのリセットに失敗しました")
    current_player = state.snake[0] if hasattr(state, "snake") else None
    return GameStateResponse(
        player_position=PositionResponse(x=current_player.x, y=current_player.y) if current_player else None,
        score=state.score,
        is_game_over=state.game_over,
        board_size=BoardSizeResponse(width=state.config.width, height=state.config.height) if state.config else None,
        food_position=PositionResponse(x=state.food.x, y=state.food.y) if state.food else None,
        snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in state.snake] if hasattr(state, "snake") else [],
        tick_count=getattr(state, "tick_count", 0) or 0,
    )


@router.post("/config", response_model=GameStateResponse)
async def configure_game(config: GameConfigRequest) -> GameStateResponse:
    """
    ゲームの設定を変更する

    Args:
        config (GameConfigRequest): 新しいゲーム設定

    Returns:
        GameStateResponse: 更新されたゲーム状態

    Raises:
        HTTPException: 無効な設定の場合
    """
    try:
        # 新しい設定でゲームを再初期化
        game_config = GameConfig(
            board_width=config.board_width or 20,
            board_height=config.board_height or 20,
            difficulty=Difficulty(config.difficulty or "normal"),
            game_mode=GameMode(config.game_mode or "classic"),
            time_limit=config.time_limit or 300,
        )
        # 新しいゲームインスタンスを作成し、モジュールレベル変数を更新
        new_game = Game(game_config)
        state = new_game.initialize_game("API Player")

        # モジュールレベル変数を更新
        globals()["game"] = new_game
        if not state:
            raise HTTPException(status_code=500, detail="ゲームの初期化に失敗しました")
        current_player = state.snake[0] if hasattr(state, "snake") else None
        return GameStateResponse(
            player_position=PositionResponse(x=current_player.x, y=current_player.y) if current_player else None,
            score=state.score,
            is_game_over=state.game_over,
            board_size=(
                BoardSizeResponse(width=state.config.width, height=state.config.height) if state.config else None
            ),
            food_position=PositionResponse(x=state.food.x, y=state.food.y) if state.food else None,
            snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in state.snake] if hasattr(state, "snake") else [],
            tick_count=getattr(state, "tick_count", 0) or 0,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"無効な設定です: {str(e)}") from e

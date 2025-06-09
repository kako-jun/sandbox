from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from ...game.core import Game
from ...game.models import GameState, GameConfig, Player, Position, Direction, GameAction, Difficulty, GameMode

# ルーターの作成
router = APIRouter()

# ゲームインスタンスの初期化
game = Game()
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
    
    current_player = state.players[state.current_player_id]
    return GameStateResponse(
        player_position=PositionResponse(x=current_player.snake_body[0].x, y=current_player.snake_body[0].y) if current_player.snake_body else None,
        score=current_player.score,
        is_game_over=state.game_over,
        board_size=BoardSizeResponse(width=state.board_width, height=state.board_height) if state.board_width and state.board_height else None,
        food_position=PositionResponse(x=state.food_position.x, y=state.food_position.y) if state.food_position else None,
        snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in current_player.snake_body],
        tick_count=state.tick_count
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
    
    current_player = state.players[state.current_player_id]
    action = GameAction(player_id=current_player.id, action_type="move", direction=request.direction)
    if not game.process_action(action):
        raise HTTPException(status_code=400, detail="無効な移動です")
    
    return GameStateResponse(
        player_position=PositionResponse(x=current_player.snake_body[0].x, y=current_player.snake_body[0].y) if current_player.snake_body else None,
        score=current_player.score,
        is_game_over=state.game_over,
        board_size=BoardSizeResponse(width=state.board_width, height=state.board_height) if state.board_width and state.board_height else None,
        food_position=PositionResponse(x=state.food_position.x, y=state.food_position.y) if state.food_position else None,
        snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in current_player.snake_body],
        tick_count=state.tick_count
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
    
    current_player = state.players[state.current_player_id]
    return GameStateResponse(
        player_position=PositionResponse(x=current_player.snake_body[0].x, y=current_player.snake_body[0].y) if current_player.snake_body else None,
        score=current_player.score,
        is_game_over=state.game_over,
        board_size=BoardSizeResponse(width=state.board_width, height=state.board_height) if state.board_width and state.board_height else None,
        food_position=PositionResponse(x=state.food_position.x, y=state.food_position.y) if state.food_position else None,
        snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in current_player.snake_body],
        tick_count=state.tick_count
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
            time_limit=config.time_limit
        )
        game = Game()
        state = game.initialize_game("API Player")
        
        if not state:
            raise HTTPException(status_code=500, detail="ゲームの初期化に失敗しました")
        
        current_player = state.players[state.current_player_id]
        return GameStateResponse(
            player_position=PositionResponse(x=current_player.snake_body[0].x, y=current_player.snake_body[0].y) if current_player.snake_body else None,
            score=current_player.score,
            is_game_over=state.game_over,
            board_size=BoardSizeResponse(width=state.board_width, height=state.board_height) if state.board_width and state.board_height else None,
            food_position=PositionResponse(x=state.food_position.x, y=state.food_position.y) if state.food_position else None,
            snake_body=[PositionResponse(x=pos.x, y=pos.y) for pos in current_player.snake_body],
            tick_count=state.tick_count
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"無効な設定です: {str(e)}")
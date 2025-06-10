from typing import Optional, Dict
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from ..game.core import Game
from ..game.models import GameConfig, GameAction
from ..utils.i18n import get_text
from ..utils.logging import setup_logger

# ロガーの設定
logger = setup_logger(__name__)

# 国際化の設定
i18n = get_text

# FastAPIアプリケーションの作成
app = FastAPI(title="Snake Game Web", description="Pythonで実装されたスネークゲームのWeb API", version="0.1.0")

# 静的ファイルの設定
BASE_DIR = Path(__file__).resolve().parent.parent.parent
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# テンプレートの設定
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# ゲームインスタンスの管理
games: Dict[str, Game] = {}


class DirectionRequest(BaseModel):
    direction: str


class GameConfigRequest(BaseModel):
    board_width: Optional[int] = 20
    board_height: Optional[int] = 15
    difficulty: Optional[str] = "normal"
    game_mode: Optional[str] = "classic"
    time_limit: Optional[int] = None


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    """
    メインページを表示する

    Args:
        request (Request): リクエストオブジェクト

    Returns:
        HTMLResponse: レンダリングされたHTML
    """
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/game", response_class=HTMLResponse)
async def game_page(request: Request) -> HTMLResponse:
    """
    ゲームページを表示する

    Args:
        request (Request): リクエストオブジェクト

    Returns:
        HTMLResponse: レンダリングされたHTML
    """
    return templates.TemplateResponse("game.html", {"request": request})


@app.get("/api/health")
async def health_check():
    """
    ヘルスチェックを行う

    Returns:
        Dict[str, str]: ヘルスチェックの結果
    """
    return {"status": "ok"}


@app.get("/api/game/state/{player_id}")
async def get_game_state(player_id: str):
    """ゲーム状態を取得"""
    if player_id not in games:
        return {"error": "Game not found"}, 404

    game = games[player_id]
    state = game.get_state()
    if not state:
        return {"error": "Game state not found"}, 404

    return state


@app.post("/api/game/action")
async def process_game_action(action: GameAction):
    """ゲームアクションを処理"""
    if action.player_id not in games:
        return {"error": "Game not found"}, 404

    game = games[action.player_id]
    # GameActionを使って適切に処理 (Gameクラスにはprocess_actionメソッドがないため、directionで移動)
    if action.action_type == "move" and action.direction:
        if not game.move(action.direction):
            return {"error": "Invalid action"}, 400
    else:
        return {"error": "Unsupported action"}, 400

    return {"status": "success"}


@app.post("/api/game/reset/{player_id}")
async def reset_game(player_id: str):
    """ゲームをリセット"""
    if player_id not in games:
        return {"error": "Game not found"}, 404

    game = games[player_id]
    state = game.reset()
    if not state:
        return {"error": "Failed to reset game"}, 400

    return state


@app.post("/api/game/configure/{player_id}")
async def configure_game(player_id: str, config: GameConfig):
    """ゲームの設定を変更"""
    if player_id not in games:
        return {"error": "Game not found"}, 404

    # Gameクラスにはconfigureメソッドがないため、新しいゲームを作成
    game = Game(config=config)
    state = game.initialize_game(player_id)
    if not state:
        return {"error": "Failed to configure game"}, 400

    games[player_id] = game
    return state


@app.post("/api/game/create")
async def create_game(player_name: str, config: Optional[GameConfig] = None):
    """新しいゲームを作成"""
    if config is None:
        config = GameConfig()

    game = Game(config=config)
    state = game.initialize_game(player_name)
    if not state:
        return {"error": "Failed to create game"}, 400

    games[player_name] = game
    return state


def main() -> None:
    """Webサーバーを起動する"""
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=10500)


if __name__ == "__main__":
    main()

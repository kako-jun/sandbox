import sys
import time
import json
import argparse
from typing import Optional, Dict, Any, cast
import requests

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm

from src.game.core import SnakeGame
from src.game.models import GameConfig, Player, Position, Difficulty, GameMode, Direction, GameState
from src.utils.logging import setup_logger
from src.utils.i18n import get_text

# APIサーバーのURLとポート番号を定数として定義
API_URL = "http://localhost:10400"

# ロガーの設定
logger = setup_logger(__name__)

# 国際化の設定
i18n = get_text


def get_user_inputs() -> Dict[str, Any]:
    """
    対話形式でユーザーから入力を受け取る

    Returns:
        Dict[str, Any]: 以下のキーを持つ辞書
            - player_name: プレイヤー名
            - difficulty: 難易度（easy/normal/hard）
            - game_mode: ゲームモード（classic/time_attack/puzzle）
            - board_size: ボードサイズ（width, height）のタプル（オプション）
            - time_limit: 制限時間（秒）（オプション）
    """
    inputs = {}

    # プレイヤー名の入力
    inputs["player_name"] = Prompt.ask(i18n("enter_player_name", "en"), default="Player")

    # 難易度の選択
    difficulty = Prompt.ask(i18n("select_difficulty", "en"), choices=["easy", "normal", "hard"], default="normal")
    inputs["difficulty"] = difficulty

    # ゲームモードの選択
    mode = Prompt.ask(i18n("select_game_mode", "en"), choices=["classic", "time_attack", "puzzle"], default="classic")
    inputs["game_mode"] = mode

    # カスタム設定の確認
    if Confirm.ask(i18n("custom_settings", "en")):
        inputs["board_size"] = (
            int(Prompt.ask(i18n("board_width", "en"), default="10")),
            int(Prompt.ask(i18n("board_height", "en"), default="10")),
        )
        inputs["time_limit"] = int(Prompt.ask(i18n("time_limit", "en"), default="300"))

    return inputs


class GameDisplay:
    def __init__(self, game: SnakeGame, lang: str = "en", config: Optional[Dict[str, Any]] = None):
        """
        ゲーム表示クラスの初期化

        Args:
            game (Game): ゲームインスタンス
            lang (str): 言語設定（デフォルト: "en"）
            config (Optional[Dict[str, Any]]): ゲーム設定
                以下のキーを持つ辞書:
                - player_name: プレイヤー名
                - difficulty: 難易度
                - game_mode: ゲームモード
                - board_size: ボードサイズ
                - time_limit: 制限時間
        """
        self.game = game
        self.console = Console()
        self.lang = lang
        self.config = config or {}

    def draw(self) -> None:
        """
        ゲーム画面の描画

        以下の要素を描画:
        - ゲームボード（蛇と食べ物）
        - スコア
        - ゲームオーバー状態
        - プレイヤー情報
        - 難易度情報
        """
        try:
            state = self.game.state
            if not state:
                self.console.print("ゲーム状態が初期化されていません")
                return

            # state.playersとstate.current_player_idのNoneチェック
            if not state.players or state.current_player_id is None:
                self.console.print("プレイヤー情報が初期化されていません")
                return

            # current_player_idがプレイヤー辞書に存在するかチェック
            if state.current_player_id not in state.players:
                self.console.print("現在のプレイヤーが見つかりません")
                return

            # 現在のプレイヤーを取得
            current_player = state.players[state.current_player_id]

            # state.board_widthとstate.board_heightのNoneチェック
            if state.board_width is None or state.board_height is None:
                self.console.print("ボードサイズが初期化されていません")
                return

            # 空のボードを作成
            board = [[" " for _ in range(state.board_width)] for _ in range(state.board_height)]

            # 蛇の体を配置
            for pos in current_player.snake_body:
                if 0 <= pos.x < state.board_width and 0 <= pos.y < state.board_height:
                    board[pos.y][pos.x] = "●"

            # 食べ物を配置
            if state.food_position:
                food = state.food_position
                if 0 <= food.x < state.board_width and 0 <= food.y < state.board_height:
                    board[food.y][food.x] = "★"

            # ボードを文字列に変換
            board_str = "\n".join("".join(row) for row in board)

            # ゲーム情報を作成
            info = f"スコア: {current_player.score}"
            if state.game_over:
                info += f"\n{i18n('game_over', self.lang)}"

            # プレイヤー名と難易度を追加（設定されている場合）
            if self.config.get("player_name"):
                info = f"{i18n('player', self.lang)}: {self.config['player_name']}\n" + info
            if self.config.get("difficulty"):
                info += f"\n{i18n('difficulty', self.lang)}: {self.config['difficulty']}"

            # パネルを作成
            panel = Panel(
                Text(board_str, style="bold green"),
                title=i18n("welcome", self.lang),
                subtitle=info,
                border_style="blue",
            )

            # 画面をクリアして描画
            self.console.clear()
            self.console.print(panel)

        except (KeyError, IndexError, AttributeError) as e:
            self.console.print(f"[red]描画中にエラーが発生しました: {str(e)}[/red]")


def parse_args():
    """コマンドライン引数を解析"""
    parser = argparse.ArgumentParser(description="Snake Game CLI", formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--version", action="version", version="Snake Game 1.0.0")

    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # startコマンド
    start_parser = subparsers.add_parser("start", help="Start a new game")
    start_parser.add_argument("--width", type=int, default=20, help="Board width (default: 20)")
    start_parser.add_argument("--height", type=int, default=20, help="Board height (default: 20)")
    start_parser.add_argument("--speed", type=float, default=1.0, help="Initial speed (default: 1.0)")
    start_parser.add_argument("--food-value", type=int, default=10, help="Points per food (default: 10)")
    start_parser.add_argument("--time-limit", type=int, default=300, help="Time limit in seconds (default: 300)")

    return parser.parse_args()


def validate_config(args):
    """設定値の検証"""
    if args.width <= 0:
        print("Error: Width must be positive", file=sys.stderr)
        sys.exit(1)
    if args.height <= 0:
        print("Error: Height must be positive", file=sys.stderr)
        sys.exit(1)
    if args.speed <= 0:
        print("Error: Speed must be positive", file=sys.stderr)
        sys.exit(1)
    if args.food_value <= 0:
        print("Error: Food value must be positive", file=sys.stderr)
        sys.exit(1)
    if args.time_limit <= 0:
        print("Error: Time limit must be positive", file=sys.stderr)
        sys.exit(1)


def load_config(config_path: str) -> Dict[str, Any]:
    """
    設定ファイルを読み込む

    Args:
        config_path (str): 設定ファイルのパス

    Returns:
        Dict[str, Any]: 設定内容

    Raises:
        FileNotFoundError: 設定ファイルが見つからない場合
        json.JSONDecodeError: 設定ファイルの形式が不正な場合
    """
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error("設定ファイルが見つかりません: %s", config_path)
        raise
    except json.JSONDecodeError:
        logger.error("設定ファイルの形式が不正です: %s", config_path)
        raise


def create_game_config(args: argparse.Namespace, config: Optional[Dict[str, Any]] = None) -> GameConfig:
    """
    ゲーム設定を作成する

    Args:
        args (argparse.Namespace): コマンドライン引数
        config (Optional[Dict[str, Any]]): 設定ファイルの内容

    Returns:
        GameConfig: ゲーム設定
    """

    def safe_int(val, default):
        try:
            if val is not None:
                return int(val)
        except (ValueError, TypeError):
            pass
        return default

    # board_width
    board_width = safe_int(getattr(args, "width", None), None)
    if board_width is None:
        board_width = safe_int(config.get("width") if config else None, 20)
    # board_height
    board_height = safe_int(getattr(args, "height", None), None)
    if board_height is None:
        board_height = safe_int(config.get("height") if config else None, 20)
    # difficulty
    difficulty = getattr(args, "difficulty", None) or (config.get("difficulty") if config else None) or "normal"
    # game_mode
    game_mode = getattr(args, "game_mode", None) or (config.get("game_mode") if config else None) or "classic"
    # time_limit
    time_limit = safe_int(getattr(args, "time_limit", None), None)
    if time_limit is None:
        time_limit = safe_int(config.get("time_limit") if config else None, 300)

    return GameConfig(
        board_width=board_width,
        board_height=board_height,
        difficulty=Difficulty(str(difficulty)),
        game_mode=GameMode(str(game_mode)),
        time_limit=time_limit,
    )


def get_api_game_state(api_url: str) -> Optional[GameState]:
    """
    APIからゲーム状態を取得する

    Args:
        api_url (str): APIサーバーのURL

    Returns:
        Optional[GameState]: ゲーム状態、取得に失敗した場合はNone
    """
    try:
        response = requests.get(f"{api_url}/game/state", timeout=30)
        response.raise_for_status()
        data = response.json()

        # 蛇の体の最初の位置を現在位置として使用
        snake_body = [Position(x=pos["x"], y=pos["y"]) for pos in data["snake_body"]]
        current_position = snake_body[0] if snake_body else Position(x=0, y=0)

        # ゲーム状態を作成
        player = Player(
            id="0",  # stringに変更
            name="API Player",
            score=data["score"],
            snake_body=snake_body,
            direction=Direction.RIGHT,
            position=current_position,
        )

        return GameState(
            players={0: player},
            current_player_id=0,
            game_over=data["is_game_over"],
            board_width=data["board_size"]["width"],
            board_height=data["board_size"]["height"],
            food_position=(
                Position(x=data["food_position"]["x"], y=data["food_position"]["y"]) if data["food_position"] else None
            ),
            tick_count=data["tick_count"],
        )
    except requests.RequestException as e:
        logger.error("APIからのゲーム状態の取得に失敗しました: %s", e)
        return None


def move_api_snake(api_url: str, direction: Direction) -> bool:
    """
    APIを通じて蛇を移動させる

    Args:
        api_url (str): APIサーバーのURL
        direction (Direction): 移動方向

    Returns:
        bool: 移動に成功した場合はTrue、失敗した場合はFalse
    """
    try:
        response = requests.post(f"{api_url}/game/move", json={"direction": direction.value}, timeout=30)
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("蛇の移動に失敗しました: %s", e)
        return False


def reset_api_game(api_url: str) -> bool:
    """
    APIを通じてゲームをリセットする

    Args:
        api_url (str): APIサーバーのURL

    Returns:
        bool: リセットに成功した場合はTrue、失敗した場合はFalse
    """
    try:
        response = requests.post(f"{api_url}/game/reset", timeout=30)
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("ゲームのリセットに失敗しました: %s", e)
        return False


def play_api_game(api_url: str) -> None:
    """API経由でゲームをプレイする"""
    while True:
        state = get_api_game_state(api_url)
        if not state:
            logger.error("ゲーム状態の取得に失敗しました")
            break

        # playersとcurrent_player_idのNoneチェック
        if not state.players or state.current_player_id is None:
            logger.error("プレイヤー情報が正しく設定されていません")
            break

        # プレイヤーが存在するかチェック
        players = state.players
        player_id = state.current_player_id

        # 型キャストで適切な型を指定
        players_dict = cast(Dict[int, Player], players)
        player_id_int = cast(int, player_id)
        
        if player_id_int not in players_dict:  # type: ignore[operator]
            logger.error("現在のプレイヤーが見つかりません")
            break

        current_player = players_dict[player_id_int]  # type: ignore[index]

        # ゲーム状態を表示
        print("\033[2J\033[H")  # 画面をクリア
        print(f"スコア: {current_player.score}")
        print(f"蛇の長さ: {len(current_player.snake_body)}")
        print(f"ボードサイズ: {state.board_width}x{state.board_height}")
        print(f"ゲームオーバー: {state.game_over}")

        # ユーザー入力を待機
        key = input("方向を入力してください（w/a/s/d、qで終了）: ").lower()
        if key == "q":
            break

        # 方向を設定
        direction = None
        if key == "w":
            direction = Direction.UP
        elif key == "s":
            direction = Direction.DOWN
        elif key == "a":
            direction = Direction.LEFT
        elif key == "d":
            direction = Direction.RIGHT

        if direction:
            if not move_api_snake(api_url, direction):
                logger.error("蛇の移動に失敗しました")
                break

        time.sleep(0.1)  # 少し待機


def configure_game(args: argparse.Namespace) -> Optional[GameConfig]:
    """
    ゲームの設定を行う

    Args:
        args (argparse.Namespace): コマンドライン引数

    Returns:
        Optional[GameConfig]: ゲーム設定
    """
    try:
        return GameConfig.model_validate(
            {
                "board_width": getattr(args, "width", 20),
                "board_height": getattr(args, "height", 20),
                "difficulty": getattr(args, "difficulty", "normal"),
                "game_mode": getattr(args, "game_mode", "classic"),
                "time_limit": getattr(args, "time_limit", 300),
            }
        )
    except (ValueError, TypeError) as e:
        logger.error("ゲームの設定に失敗しました: %s", str(e))
        return None


def main():
    """メイン関数"""
    args = parse_args()

    if args.command == "start":
        validate_config(args)
        config = GameConfig(
            board_width=args.width,
            board_height=args.height,
            initial_speed=args.speed,
            speed_increase=0.1,
            food_value=args.food_value,
            time_limit=args.time_limit,
        )
        game = SnakeGame(config)
        state = game.initialize_game("player1")
        if not state:
            print("Error: Failed to initialize game", file=sys.stderr)
            sys.exit(1)
        print("Game started successfully")
    else:
        print("Error: No command specified", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

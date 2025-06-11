"""
メインエントリーポイント

CUI版とGUI版の起動を制御
"""

import argparse
import sys
from typing import Optional

from game.cui import CUIApp
from game.gui import PyGameApp
from game.models import GameConfig, GameMode, Language
from utils.error_handler import (
    cleanup_error_handler,
    get_error_handler,
    setup_global_exception_handler,
)
from utils.i18n import init_i18n, t
from utils.logging import cleanup_old_logs, get_logger, setup_logging
from utils.storage import ConfigManager, ensure_directories


def parse_arguments() -> argparse.Namespace:
    """コマンドライン引数を解析

    Returns:
        解析された引数
    """
    parser = argparse.ArgumentParser(
        description="Python Game Template - A cross-platform game framework"
    )

    parser.add_argument(
        "--mode", choices=["gui", "cui"], default="gui", help="Game mode (default: gui)"
    )

    parser.add_argument(
        "--language", choices=["en", "ja"], help="Language (default: from config or en)"
    )

    parser.add_argument("--debug", action="store_true", help="Enable debug mode")

    parser.add_argument(
        "--fullscreen", action="store_true", help="Start in fullscreen mode (GUI only)"
    )

    parser.add_argument("--fps", type=int, metavar="N", help="Target FPS (default: 60)")

    parser.add_argument(
        "--width", type=int, metavar="N", help="Window width (GUI only, default: 800)"
    )

    parser.add_argument(
        "--height", type=int, metavar="N", help="Window height (GUI only, default: 600)"
    )

    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Log level (default: INFO)",
    )

    parser.add_argument(
        "--no-console-log", action="store_true", help="Disable console logging"
    )

    parser.add_argument(
        "--no-file-log", action="store_true", help="Disable file logging"
    )

    return parser.parse_args()


def load_config(args: argparse.Namespace) -> GameConfig:
    """設定を読み込み

    Args:
        args: コマンドライン引数

    Returns:
        ゲーム設定
    """
    config_manager = ConfigManager()

    # 保存された設定を読み込み
    config = config_manager.load_config(GameConfig)
    if config is None:
        config = GameConfig()

    # コマンドライン引数で上書き
    if args.mode:
        config.mode = GameMode(args.mode)

    if args.language:
        config.language = Language(args.language)

    if args.debug:
        config.debug = True

    if args.fullscreen:
        config.fullscreen = True

    if args.fps:
        config.fps = max(1, min(120, args.fps))

    if args.width and args.height:
        config.window_size.width = max(400, args.width)
        config.window_size.height = max(300, args.height)

    return config


def save_config(config: GameConfig) -> None:
    """設定を保存

    Args:
        config: 保存するゲーム設定
    """
    try:
        config_manager = ConfigManager()
        config_manager.save_config(config)
    except Exception as e:
        get_logger().warning(f"Failed to save config: {e}")


def initialize_systems(config: GameConfig, args: argparse.Namespace) -> None:
    """システムを初期化

    Args:
        config: ゲーム設定
        args: コマンドライン引数
    """
    # ディレクトリ作成
    ensure_directories()

    # ログ設定
    log_level = args.log_level or ("DEBUG" if config.debug else "INFO")
    console_output = not args.no_console_log
    file_output = not args.no_file_log

    setup_logging(log_level, console_output, file_output)

    # 古いログをクリーンアップ
    cleanup_old_logs()

    # 国際化システム初期化
    init_i18n(config.language)

    # グローバル例外ハンドラー設定
    setup_global_exception_handler()


def run_game(config: GameConfig) -> int:
    """ゲームを実行

    Args:
        config: ゲーム設定

    Returns:
        終了コード
    """
    logger = get_logger()

    try:
        logger.info(t("message_game_started"))
        mode_str = config.mode if isinstance(config.mode, str) else config.mode.value
        lang_str = config.language if isinstance(config.language, str) else config.language.value
        logger.info(f"Mode: {mode_str}, Language: {lang_str}")

        if (isinstance(config.mode, str) and config.mode == "gui") or config.mode == GameMode.GUI:
            app = PyGameApp(config)
        else:
            app = CUIApp(config)

        app.run()

        logger.info(t("message_game_quit"))
        return 0

    except KeyboardInterrupt:
        logger.info("Game interrupted by user")
        return 0
    except Exception as e:
        get_error_handler().handle_error(e, "Main Game Loop", fatal=False)
        return 1


def main() -> int:
    """メイン関数

    Returns:
        終了コード
    """
    try:
        # コマンドライン引数解析
        args = parse_arguments()

        # 設定読み込み
        config = load_config(args)

        # システム初期化
        initialize_systems(config, args)

        # ゲーム実行
        exit_code = run_game(config)

        # 設定保存
        save_config(config)

        return exit_code

    except Exception as e:
        print(f"Fatal error during startup: {e}")
        return 1
    finally:
        # クリーンアップ
        cleanup_error_handler()


if __name__ == "__main__":
    sys.exit(main())

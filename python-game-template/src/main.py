"""
メインエントリーポイント

CUI版とGUI版の起動を制御
"""

import argparse
import sys
from typing import Optional

from game.cui import CUIApp
from game.gui import PyGameApp
from game.models import GameConfig, GameMode, Language, Size
from utils.error_handler import (
    cleanup_error_handler,
    get_error_handler,
    setup_global_exception_handler,
)
from utils.i18n import init_i18n, t
from utils.logging import cleanup_old_logs, get_logger, setup_logging
from utils.process_lock import get_process_locks, check_single_instance
from utils.storage import ConfigManager, ensure_directories


def parse_arguments() -> argparse.Namespace:
    """コマンドライン引数を解析

    Returns:
        解析された引数
    """
    parser = argparse.ArgumentParser(description="Python Game Template - A cross-platform game framework")

    parser.add_argument("--cui-only", action="store_true", help="Use CUI mode only")

    parser.add_argument("--gui-only", action="store_true", help="Use GUI mode only (default)")

    parser.add_argument("--both", action="store_true", help="Run both CUI and GUI simultaneously")

    parser.add_argument("--language", choices=["en", "ja"], help="Language (default: from config or en)")

    parser.add_argument("--debug", action="store_true", help="Enable debug mode")

    parser.add_argument("--fullscreen", action="store_true", help="Start in fullscreen mode (GUI only)")

    parser.add_argument("--fps", type=int, metavar="N", help="Target FPS (default: 60)")

    parser.add_argument("--width", type=int, metavar="N", help="Window width (GUI only, default: 800)")

    parser.add_argument("--height", type=int, metavar="N", help="Window height (GUI only, default: 600)")

    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Log level (default: INFO)",
    )

    parser.add_argument("--no-console-log", action="store_true", help="Disable console logging")

    parser.add_argument("--no-file-log", action="store_true", help="Disable file logging")

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
    loaded_config = config_manager.load_config(GameConfig)
    if loaded_config is None:
        config = GameConfig()
    else:
        config = loaded_config if isinstance(loaded_config, GameConfig) else GameConfig()

    # コマンドライン引数で上書き
    updates = {}

    if args.cui_only:
        updates["mode"] = GameMode.CUI
    elif args.gui_only:
        updates["mode"] = GameMode.GUI
    elif not any([args.cui_only, args.gui_only, args.both]):
        # 引数が指定されていない場合はGUIモードをデフォルトとする
        updates["mode"] = GameMode.GUI
    # bothモードは後で処理

    if args.language:
        updates["language"] = Language(args.language)

    if args.debug:
        updates["debug"] = True

    if args.fullscreen:
        updates["fullscreen"] = True

    if args.fps:
        updates["fps"] = max(1, min(120, args.fps))

    if args.width and args.height:
        updates["window_size"] = Size(width=max(400, args.width), height=max(300, args.height))

    if updates:
        config = config.model_copy(update=updates)

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


def run_both_modes(config: GameConfig) -> int:
    """CUI版とGUI版を同時実行

    Args:
        config: ゲーム設定

    Returns:
        終了コード
    """
    import threading
    import time

    from game.core import GameEngine
    from utils.audio import get_audio_manager
    from utils.timing import get_timing_manager

    logger = get_logger()
    logger.info("Starting both CUI and GUI modes simultaneously")

    # 共有ゲームエンジンとマネージャーを作成
    shared_engine = GameEngine(config)
    shared_audio = get_audio_manager()
    shared_timing = get_timing_manager()

    # 共有マネージャーを設定
    shared_engine.audio_manager = shared_audio
    shared_engine.timing_manager = shared_timing

    # 例外処理用
    exceptions = []

    def run_cui():
        try:
            cui_app = CUIApp(config)
            # 共有エンジンを使用するように設定
            cui_app.engine = shared_engine
            cui_app.audio_manager = shared_audio
            cui_app.timing_manager = shared_timing
            cui_app.run()
        except Exception as e:
            exceptions.append(("CUI", e))

    def run_gui():
        try:
            gui_app = PyGameApp(config)
            # 共有エンジンを使用するように設定
            gui_app.engine = shared_engine
            gui_app.audio_manager = shared_audio
            gui_app.timing_manager = shared_timing
            gui_app.run()
        except Exception as e:
            exceptions.append(("GUI", e))

    try:
        # CUI版を別スレッドで開始
        cui_thread = threading.Thread(target=run_cui, daemon=True)
        cui_thread.start()

        # 少し待ってからGUI版を開始（初期化の競合を避ける）
        time.sleep(0.5)

        # GUI版をメインスレッドで実行
        run_gui()

        # CUI版の終了を待つ
        cui_thread.join(timeout=1.0)

        # 例外があった場合は報告
        if exceptions:
            for mode, e in exceptions:
                logger.error(f"Error in {mode} mode: {e}")
            return 1

        logger.info("Both modes completed successfully")
        return 0

    except KeyboardInterrupt:
        logger.info("Both modes interrupted by user")
        return 0
    except Exception as e:
        get_error_handler().handle_error(e, "Dual Mode Game Loop", fatal=False)
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

        # プロセスロックの確認（多重起動防止）
        mode_str = "both" if args.both else "gui" if (not args.cui_only) else "cui"
        if not check_single_instance(mode_str):
            print(f"Error: Another instance of the game is already running in {mode_str} mode.")
            print("Please close the existing instance before starting a new one.")
            return 1

        # システム初期化
        initialize_systems(config, args)

        # プロセスロックを取得
        process_locks = get_process_locks(mode_str)
        
        try:
            # 全てのロックを取得
            for lock in process_locks:
                if not lock.acquire():
                    # ロック取得に失敗した場合、既に取得済みのロックを解放
                    for acquired_lock in process_locks:
                        if acquired_lock != lock:
                            acquired_lock.release()
                    print(f"Error: Could not acquire process lock for {mode_str} mode.")
                    return 1

            # ゲーム実行
            if args.both:
                exit_code = run_both_modes(config)
            else:
                exit_code = run_game(config)

            # 設定保存
            save_config(config)

            return exit_code

        finally:
            # プロセスロックを解放
            for lock in process_locks:
                lock.release()

    except Exception as e:
        print(f"Fatal error during startup: {e}")
        return 1
    finally:
        # クリーンアップ
        cleanup_error_handler()


if __name__ == "__main__":
    sys.exit(main())

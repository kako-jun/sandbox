"""
エラー制御システム

アプリケーションの堅牢性を向上させるためのエラー処理機能
"""

import functools
import sys
import traceback
from typing import Any, Callable, Optional, TypeVar

from utils.i18n import t
from utils.logging import get_logger

# 型変数
T = TypeVar("T")
F = TypeVar("F", bound=Callable[..., Any])


class GameError(Exception):
    """ゲーム関連のエラー基底クラス"""

    def __init__(self, message: str, error_code: Optional[str] = None):
        """初期化

        Args:
            message: エラーメッセージ
            error_code: エラーコード
        """
        super().__init__(message)
        self.message = message
        self.error_code = error_code


class ConfigError(GameError):
    """設定関連のエラー"""

    pass


class SaveDataError(GameError):
    """セーブデータ関連のエラー"""

    pass


class RenderError(GameError):
    """描画関連のエラー"""

    pass


class InputError(GameError):
    """入力関連のエラー"""

    pass


class ErrorHandler:
    """エラーハンドラークラス"""

    def __init__(self):
        """初期化"""
        self.logger = get_logger("error_handler")
        self.error_count = 0
        self.last_error: Optional[Exception] = None

    def handle_error(
        self, error: Exception, context: str = "Unknown", fatal: bool = False
    ) -> None:
        """エラーを処理

        Args:
            error: 発生したエラー
            context: エラーが発生したコンテキスト
            fatal: 致命的エラーかどうか
        """
        self.error_count += 1
        self.last_error = error

        error_msg = f"Error in {context}: {str(error)}"

        if fatal:
            self.logger.critical(error_msg)
            self.logger.exception("Fatal error occurred")

            # 致命的エラーの場合は終了
            print(f"\nFatal error: {error_msg}")
            print("The application will now exit.")
            sys.exit(1)
        else:
            self.logger.error(error_msg)
            self.logger.exception("Error details")

    def get_error_count(self) -> int:
        """エラー発生回数を取得

        Returns:
            エラー発生回数
        """
        return self.error_count

    def get_last_error(self) -> Optional[Exception]:
        """最後に発生したエラーを取得

        Returns:
            最後に発生したエラー
        """
        return self.last_error

    def reset_error_count(self) -> None:
        """エラー発生回数をリセット"""
        self.error_count = 0
        self.last_error = None


# グローバルエラーハンドラー
_error_handler: Optional[ErrorHandler] = None


def get_error_handler() -> ErrorHandler:
    """エラーハンドラーを取得

    Returns:
        エラーハンドラーインスタンス
    """
    global _error_handler
    if _error_handler is None:
        _error_handler = ErrorHandler()
    return _error_handler


def safe_execute(
    func: Callable[..., T], *args, default: T = None, context: str = "Unknown", **kwargs
) -> T:
    """安全に関数を実行

    Args:
        func: 実行する関数
        *args: 関数の引数
        default: エラー時のデフォルト値
        context: エラーコンテキスト
        **kwargs: 関数のキーワード引数

    Returns:
        実行結果またはデフォルト値
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        get_error_handler().handle_error(e, context)
        return default


def error_handler(
    context: str = None, default: Any = None, fatal: bool = False
) -> Callable[[F], F]:
    """エラーハンドリングデコレーター

    Args:
        context: エラーコンテキスト
        default: エラー時のデフォルト値
        fatal: 致命的エラーかどうか

    Returns:
        デコレートされた関数
    """

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_context = context or func.__name__
                get_error_handler().handle_error(e, error_context, fatal)
                return default

        return wrapper

    return decorator


def validate_type(value: Any, expected_type: type, name: str = "value") -> Any:
    """型チェックを実行

    Args:
        value: チェックする値
        expected_type: 期待する型
        name: 値の名前（エラーメッセージ用）

    Returns:
        検証された値

    Raises:
        TypeError: 型が不正な場合
    """
    if not isinstance(value, expected_type):
        raise TypeError(
            f"{name} must be {expected_type.__name__}, got {type(value).__name__}"
        )
    return value


def validate_range(
    value: float,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None,
    name: str = "value",
) -> float:
    """範囲チェックを実行

    Args:
        value: チェックする値
        min_val: 最小値
        max_val: 最大値
        name: 値の名前（エラーメッセージ用）

    Returns:
        検証された値

    Raises:
        ValueError: 範囲外の場合
    """
    if min_val is not None and value < min_val:
        raise ValueError(f"{name} must be >= {min_val}, got {value}")
    if max_val is not None and value > max_val:
        raise ValueError(f"{name} must be <= {max_val}, got {value}")
    return value


def validate_not_none(value: Any, name: str = "value") -> Any:
    """None チェックを実行

    Args:
        value: チェックする値
        name: 値の名前（エラーメッセージ用）

    Returns:
        検証された値

    Raises:
        ValueError: None の場合
    """
    if value is None:
        raise ValueError(f"{name} cannot be None")
    return value


class SafeDict(dict):
    """安全な辞書クラス

    存在しないキーにアクセスした場合にNoneを返し、例外を発生させない
    """

    def __getitem__(self, key):
        """キーで値を取得

        Args:
            key: キー

        Returns:
            値、またはNone
        """
        try:
            return super().__getitem__(key)
        except KeyError:
            get_logger().warning(f"Accessing non-existent key: {key}")
            return None

    def get_safe(self, key: Any, default: Any = None) -> Any:
        """安全にキーで値を取得

        Args:
            key: キー
            default: デフォルト値

        Returns:
            値またはデフォルト値
        """
        return self.get(key, default)


def setup_global_exception_handler() -> None:
    """グローバル例外ハンドラーを設定"""

    def handle_exception(exc_type, exc_value, exc_traceback):
        """未処理例外のハンドラー"""
        if issubclass(exc_type, KeyboardInterrupt):
            # Ctrl+C は通常通り処理
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return

        error_msg = f"Uncaught exception: {exc_type.__name__}: {exc_value}"
        get_error_handler().handle_error(
            Exception(error_msg), "Global Exception Handler", fatal=True
        )

    sys.excepthook = handle_exception


def cleanup_error_handler() -> None:
    """エラーハンドラーのクリーンアップ"""
    global _error_handler
    if _error_handler:
        logger = get_logger("cleanup")
        if _error_handler.error_count > 0:
            logger.info(f"Session ended with {_error_handler.error_count} errors")
        _error_handler = None

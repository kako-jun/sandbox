"""
ユーティリティモジュール

共通機能とヘルパー関数
"""

from utils.audio import AudioManager, cleanup_audio, get_audio_manager
from utils.error_handler import (
    ConfigError,
    GameError,
    InputError,
    RenderError,
    SafeDict,
    SaveDataError,
    error_handler,
    get_error_handler,
    safe_execute,
    setup_global_exception_handler,
    validate_not_none,
    validate_range,
    validate_type,
)
from utils.i18n import get_i18n, get_language, init_i18n, set_language, t
from utils.logging import (
    GameLogger,
    PerformanceLogger,
    cleanup_old_logs,
    get_logger,
    get_performance_logger,
    setup_logging,
)
from utils.storage import (
    ConfigManager,
    SaveDataManager,
    cleanup_temp_files,
    ensure_directories,
    get_app_data_dir,
    get_config_dir,
    get_save_data_dir,
    get_storage_info,
)
from utils.terminal import Screen, TerminalController
from utils.timing import (
    FrameCounter,
    TimingManager,
    cleanup_timing,
    get_frame_counter,
    get_timing_manager,
)

__all__ = [
    # Audio
    "AudioManager",
    "get_audio_manager",
    "cleanup_audio",
    # Error handling
    "GameError",
    "ConfigError",
    "SaveDataError",
    "RenderError",
    "InputError",
    "SafeDict",
    "error_handler",
    "get_error_handler",
    "safe_execute",
    "setup_global_exception_handler",
    "validate_type",
    "validate_range",
    "validate_not_none",
    # Internationalization
    "t",
    "get_i18n",
    "set_language",
    "get_language",
    "init_i18n",
    # Logging
    "GameLogger",
    "PerformanceLogger",
    "get_logger",
    "get_performance_logger",
    "setup_logging",
    "cleanup_old_logs",
    # Storage
    "ConfigManager",
    "SaveDataManager",
    "get_app_data_dir",
    "get_config_dir",
    "get_save_data_dir",
    "get_storage_info",
    "ensure_directories",
    "cleanup_temp_files",
    # Terminal
    "TerminalController",
    "Screen",
    # Timing
    "TimingManager",
    "FrameCounter",
    "get_timing_manager",
    "get_frame_counter",
    "cleanup_timing",
]

import logging
import logging.handlers
import os
from pathlib import Path
from typing import Optional

# ログディレクトリの設定
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# ログファイルの設定
LOG_FILE = LOG_DIR / "app.log"
MAX_BYTES = 10 * 1024 * 1024  # 10MB
BACKUP_COUNT = 5

def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """ロガーの設定を行う"""
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # ファイルハンドラの設定（ローテーション付き）
    file_handler = logging.handlers.RotatingFileHandler(
        LOG_FILE,
        maxBytes=MAX_BYTES,
        backupCount=BACKUP_COUNT,
        encoding='utf-8'
    )
    file_handler.setLevel(level)
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    # コンソールハンドラの設定
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_formatter = logging.Formatter(
        '%(levelname)s: %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    return logger

# アプリケーション全体で使用するロガー
app_logger = setup_logger('python-game-template') 
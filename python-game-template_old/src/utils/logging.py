import logging
import sys
import os
import platform
from pathlib import Path
from typing import Optional
from logging.handlers import RotatingFileHandler

def get_log_dir() -> Path:
    """
    ログディレクトリのパスを取得する
    環境変数LOG_DIRが設定されている場合はそれを使用し、
    そうでない場合はOSに応じた標準的なログディレクトリを使用する
    """
    if log_dir := os.getenv("LOG_DIR"):
        return Path(log_dir)
    
    system = platform.system().lower()
    app_name = "python-game-template"
    
    if system == "windows":
        # Windows: %LOCALAPPDATA%\python-game-template\logs
        base_dir = Path(os.getenv("LOCALAPPDATA", "")) / app_name
    elif system == "darwin":
        # macOS: ~/Library/Logs/python-game-template
        base_dir = Path.home() / "Library" / "Logs" / app_name
    else:
        # Linux/Unix: ~/.local/share/python-game-template/logs
        # XDG Base Directoryに従う
        xdg_data_home = os.getenv("XDG_DATA_HOME")
        if xdg_data_home:
            base_dir = Path(xdg_data_home) / app_name
        else:
            base_dir = Path.home() / ".local" / "share" / app_name
    
    log_dir = base_dir / "logs"
    try:
        log_dir.mkdir(parents=True, exist_ok=True)
    except (PermissionError, OSError) as e:
        # ログディレクトリの作成に失敗した場合、一時ディレクトリを使用
        logging.warning(f"Failed to create log directory {log_dir}: {e}")
        log_dir = Path(os.getenv("TEMP", os.getenv("TMP", "/tmp"))) / app_name / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
    
    return log_dir

def setup_logger(name: str, log_level: int = logging.INFO, log_file: Optional[Path] = None) -> logging.Logger:
    """
    ロガーを設定する
    
    Args:
        name (str): ロガーの名前
        log_level (int): ログレベル（デフォルト: logging.INFO）
        log_file (Optional[Path]): ログファイルのパス（デフォルト: None）
        
    Returns:
        logging.Logger: 設定されたロガー
    """
    # ロガーを作成
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    
    # フォーマッターを作成
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # コンソールハンドラーを設定
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # ファイルハンドラーを設定（指定された場合）
    if log_file:
        try:
            # ログローテーションの設定
            file_handler = RotatingFileHandler(
                log_file,
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5,
                encoding='utf-8'
            )
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except (PermissionError, OSError) as e:
            logger.warning(f"Failed to set up file logging: {e}")
    
    return logger

# アプリケーション全体で使用するロガー
app_logger = setup_logger('game', log_file=get_log_dir() / "game.log") 
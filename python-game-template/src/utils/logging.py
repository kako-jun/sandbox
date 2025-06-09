import logging
import sys
from pathlib import Path
from typing import Optional

# ログファイルのパス
LOG_FILE = Path(__file__).parent.parent.parent / "logs" / "game.log"

# ログディレクトリが存在しない場合は作成
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

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
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

# アプリケーション全体で使用するロガー
app_logger = setup_logger('game', log_file=LOG_FILE) 
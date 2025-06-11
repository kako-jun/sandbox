import os
import sys
import time
import json
import logging
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from src.utils.i18n import get_text
from src.utils.logging import setup_logger

def test_get_text() -> None:
    """get_text関数をテストする"""
    # デフォルトの言語（日本語）でテスト
    assert get_text("game.title") == "スネークゲーム"
    assert get_text("game.start") == "ゲーム開始"
    assert get_text("game.over") == "ゲームオーバー"
    
    # 存在しないキーの場合
    assert get_text("invalid.key") == "invalid.key"

def test_setup_logger() -> None:
    """setup_logger関数をテストする"""
    logger = setup_logger("test")
    assert logger.name == "test"
    assert logger.level == logging.INFO
    
    # ログ出力のテスト
    logger.info("テストメッセージ")
    logger.error("エラーメッセージ")
    logger.warning("警告メッセージ")
    logger.debug("デバッグメッセージ") 
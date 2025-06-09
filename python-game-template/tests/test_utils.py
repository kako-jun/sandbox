import unittest
from unittest.mock import patch, mock_open
import json
from pathlib import Path
import os
import tempfile
from src.utils.i18n import I18n, i18n
import sys
import time
import logging
from typing import Optional, Dict, Any, List, Tuple, Union
from src.utils.logging import setup_logger

class TestI18n(unittest.TestCase):
    def setUp(self):
        self.test_translations = {
            "en": {
                "welcome": "Python Game",
                "score": "Score: {score}",
                "error": "Error: {error}"
            },
            "ja": {
                "welcome": "Pythonゲーム",
                "score": "スコア: {score}",
                "error": "エラー: {error}"
            }
        }
        # 一時ディレクトリを作成
        self.temp_dir = tempfile.TemporaryDirectory()
        self.i18n = I18n()
        self.i18n.lang_dir = Path(self.temp_dir.name)
        self.i18n.translations = {}

    def tearDown(self):
        # 一時ディレクトリを削除
        self.temp_dir.cleanup()

    def test_load_translations_existing_files(self):
        """既存の言語ファイルからの読み込みテスト"""
        # テスト用の言語ファイルを作成
        for lang, data in self.test_translations.items():
            with open(self.i18n.lang_dir / f"{lang}.json", 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        # 翻訳を読み込む
        self.i18n.load_translations()
        
        # 検証
        self.assertIn("en", self.i18n.translations)
        self.assertIn("ja", self.i18n.translations)
        self.assertEqual(self.i18n.translations["en"]["welcome"], "Python Game")
        self.assertEqual(self.i18n.translations["ja"]["welcome"], "Pythonゲーム")

    def test_load_translations_missing_files(self):
        """存在しない言語ファイルのテスト"""
        # 翻訳を読み込む
        self.i18n.load_translations()
        
        # 検証
        self.assertEqual(self.i18n.translations, {})

    def test_get_text_valid_key(self):
        """有効なキーでのテキスト取得テスト"""
        self.i18n.translations = self.test_translations.copy()
        
        # 英語
        text = self.i18n.get_text("welcome", "en")
        self.assertEqual(text, "Python Game")

        # 日本語
        text = self.i18n.get_text("welcome", "ja")
        self.assertEqual(text, "Pythonゲーム")

    def test_get_text_with_variables(self):
        """変数を含むテキストの取得テスト"""
        self.i18n.translations = self.test_translations.copy()
        
        # 英語
        text = self.i18n.get_text("score", "en", score=100)
        self.assertEqual(text, "Score: 100")

        # 日本語
        text = self.i18n.get_text("score", "ja", score=100)
        self.assertEqual(text, "スコア: 100")

    def test_get_text_invalid_key(self):
        """無効なキーでのテキスト取得テスト"""
        self.i18n.translations = self.test_translations.copy()
        
        # 存在しないキー
        text = self.i18n.get_text("nonexistent_key", "en")
        self.assertEqual(text, "nonexistent_key")

    def test_get_text_invalid_language(self):
        """無効な言語でのテキスト取得テスト"""
        self.i18n.translations = self.test_translations.copy()
        
        # 存在しない言語
        text = self.i18n.get_text("welcome", "fr")
        self.assertEqual(text, "welcome")  # キーをそのまま返す

    def test_get_text_error_handling(self):
        """エラーメッセージの取得テスト"""
        self.i18n.translations = self.test_translations.copy()
        
        # 英語
        text = self.i18n.get_text("error", "en", error="Invalid input")
        self.assertEqual(text, "Error: Invalid input")

        # 日本語
        text = self.i18n.get_text("error", "ja", error="無効な入力")
        self.assertEqual(text, "エラー: 無効な入力")

def test_get_text() -> None:
    """get_text関数をテストする"""
    # デフォルトの言語（日本語）でテスト
    assert i18n.get_text("game.title") == "game.title"
    assert i18n.get_text("game.start") == "game.start"
    assert i18n.get_text("game.over") == "game.over"
    
    # 存在しないキーの場合
    assert i18n.get_text("invalid.key") == "invalid.key"

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

if __name__ == '__main__':
    unittest.main() 
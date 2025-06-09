import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple, Union

# デフォルトの言語
DEFAULT_LANGUAGE = "ja"

# 翻訳データ
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "ja": {
        "game.title": "スネークゲーム",
        "game.start": "ゲーム開始",
        "game.pause": "一時停止",
        "game.resume": "再開",
        "game.over": "ゲームオーバー",
        "game.score": "スコア",
        "game.time": "残り時間",
        "game.speed": "スピード",
        "game.difficulty": "難易度",
        "game.mode": "ゲームモード"
    },
    "en": {
        "game.title": "Snake Game",
        "game.start": "Start Game",
        "game.pause": "Pause",
        "game.resume": "Resume",
        "game.over": "Game Over",
        "game.score": "Score",
        "game.time": "Time Left",
        "game.speed": "Speed",
        "game.difficulty": "Difficulty",
        "game.mode": "Game Mode"
    }
}

class I18n:
    """国際化（i18n）を管理するクラス"""
    
    def __init__(self):
        self.translations: Dict[str, Dict[str, str]] = {}
        self.current_language: str = "en"
        self.lang_dir = Path("src/locales")
        self.lang_dir.mkdir(exist_ok=True)
        self.load_translations()

    def load_translations(self) -> None:
        """翻訳ファイルを読み込む"""
        try:
            if not self.lang_dir.exists():
                logging.warning(f"Translations directory not found: {self.lang_dir}")
                return

            for lang_file in self.lang_dir.glob("*.json"):
                lang = lang_file.stem
                try:
                    with open(lang_file, "r", encoding="utf-8") as f:
                        self.translations[lang] = json.load(f)
                except Exception as e:
                    logging.error(f"Error loading translations for {lang}: {e}")

        except Exception as e:
            logging.error(f"Error loading translations: {e}")

    def set_language(self, lang: str) -> None:
        """言語を設定する"""
        if lang in self.translations:
            self.current_language = lang
        else:
            logging.warning(f"Language not found: {lang}")

    def get_text(self, key: str, lang: Optional[str] = None, **kwargs: Any) -> str:
        """翻訳テキストを取得する"""
        if lang is None:
            lang = self.current_language

        # 翻訳が存在しない場合はキーを返す
        if lang not in self.translations or key not in self.translations[lang]:
            return key

        text = self.translations[lang][key]
        
        # 変数を置換
        if kwargs:
            try:
                text = text.format(**kwargs)
            except KeyError as e:
                logging.error(f"Error formatting translation text: {e}")
        
        return text

    def get_available_languages(self) -> List[str]:
        """利用可能な言語のリストを取得する"""
        return list(self.translations.keys())

# グローバルインスタンス
i18n = I18n()

def get_text(key: str, language: Optional[str] = None) -> str:
    """指定されたキーの翻訳テキストを取得する"""
    if language is None:
        language = DEFAULT_LANGUAGE
    
    if language not in TRANSLATIONS:
        return key
    
    return TRANSLATIONS[language].get(key, key)

def set_language(lang: str) -> None:
    """言語を設定する（後方互換性のため）"""
    i18n.set_language(lang)

def get_available_languages() -> List[str]:
    """利用可能な言語のリストを取得する（後方互換性のため）"""
    return i18n.get_available_languages()

def load_translations(language: str, translations: Dict[str, str]) -> None:
    """指定された言語の翻訳データを読み込む"""
    if language not in TRANSLATIONS:
        TRANSLATIONS[language] = {}
    
    TRANSLATIONS[language].update(translations)

def add_translation(language: str, key: str, text: str) -> None:
    """新しい翻訳を追加する"""
    if language not in TRANSLATIONS:
        TRANSLATIONS[language] = {}
    
    TRANSLATIONS[language][key] = text 
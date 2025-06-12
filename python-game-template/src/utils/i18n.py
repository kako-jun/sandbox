"""
国際化（i18n）システム

多言語対応を提供
"""

import json
from pathlib import Path
from typing import Dict, Optional, Union

from game.models import Language


class I18nManager:
    """国際化管理クラス"""

    def __init__(self, default_language: Language = Language.EN):
        """初期化

        Args:
            default_language: デフォルト言語
        """
        self.default_language = default_language
        self.current_language = default_language
        self.translations: Dict[str, Dict[str, str]] = {}

        self._load_translations()

    def _load_translations(self) -> None:
        """翻訳ファイルを読み込み"""
        locales_dir = Path(__file__).parent.parent / "locales"

        for language in Language:
            locale_file = locales_dir / f"{language.value}.json"
            if locale_file.exists():
                try:
                    with open(locale_file, "r", encoding="utf-8") as f:
                        self.translations[language.value] = json.load(f)
                except Exception as e:
                    print(f"Failed to load translations for {language.value}: {e}")
                    self.translations[language.value] = {}
            else:
                self.translations[language.value] = {}

    def set_language(self, language: Union[Language, str]) -> None:
        """言語を設定

        Args:
            language: 設定する言語
        """
        if isinstance(language, str):
            # 文字列の場合、対応するLanguage enumを探す
            for lang_enum in Language:
                if lang_enum.value == language:
                    self.current_language = lang_enum
                    return
            # 見つからない場合はデフォルト言語にフォールバック
            self.current_language = self.default_language
        else:
            self.current_language = language

    def get_language(self) -> Language:
        """現在の言語を取得

        Returns:
            現在の言語
        """
        return self.current_language

    def translate(self, key: str, **kwargs) -> str:
        """翻訳を取得

        Args:
            key: 翻訳キー
            **kwargs: フォーマット用のキーワード引数

        Returns:
            翻訳された文字列
        """
        # 現在の言語での翻訳を試行
        current_lang = (
            self.current_language
            if isinstance(self.current_language, str)
            else self.current_language.value
        )
        current_lang_translations = self.translations.get(current_lang, {})
        text = current_lang_translations.get(key)

        # 見つからない場合はデフォルト言語を試行
        if text is None:
            default_lang = (
                self.default_language
                if isinstance(self.default_language, str)
                else self.default_language.value
            )
            default_lang_translations = self.translations.get(default_lang, {})
            text = default_lang_translations.get(key)

        # それでも見つからない場合はキー自体を返す
        if text is None:
            text = key

        # フォーマット処理
        try:
            return text.format(**kwargs)
        except (KeyError, ValueError):
            # フォーマットに失敗した場合は元の文字列を返す
            return text

    def get_available_languages(self) -> list[Language]:
        """利用可能な言語一覧を取得

        Returns:
            利用可能な言語のリスト
        """
        available = []
        for language in Language:
            if self.translations.get(language.value):
                available.append(language)
        return available

    def add_translation(self, language: Language, key: str, value: str) -> None:
        """翻訳を追加

        Args:
            language: 言語
            key: 翻訳キー
            value: 翻訳値
        """
        if language.value not in self.translations:
            self.translations[language.value] = {}

        self.translations[language.value][key] = value


# グローバルインスタンス
_i18n_manager: Optional[I18nManager] = None


def get_i18n() -> I18nManager:
    """国際化マネージャーを取得

    Returns:
        国際化マネージャーインスタンス
    """
    global _i18n_manager
    if _i18n_manager is None:
        _i18n_manager = I18nManager()
    return _i18n_manager


def t(key: str, **kwargs) -> str:
    """翻訳を取得（ショートカット関数）

    Args:
        key: 翻訳キー
        **kwargs: フォーマット用のキーワード引数

    Returns:
        翻訳された文字列
    """
    return get_i18n().translate(key, **kwargs)


def set_language(language: Union[Language, str]) -> None:
    """言語を設定（ショートカット関数）

    Args:
        language: 設定する言語
    """
    get_i18n().set_language(language)


def get_language() -> Language:
    """現在の言語を取得（ショートカット関数）

    Returns:
        現在の言語
    """
    return get_i18n().get_language()


def init_i18n(language: Optional[Language] = None) -> I18nManager:
    """国際化システムを初期化

    Args:
        language: 初期言語。Noneの場合はデフォルト言語を使用

    Returns:
        国際化マネージャーインスタンス
    """
    global _i18n_manager

    default_lang = language if language else Language.EN
    _i18n_manager = I18nManager(default_lang)

    if language:
        _i18n_manager.set_language(language)

    return _i18n_manager

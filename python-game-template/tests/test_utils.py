"""
ユーティリティ機能のテスト
"""

import json
import sys
import tempfile
from pathlib import Path

import pytest

src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from game.models import GameConfig, GameMode, Language
from utils.error_handler import (
    GameError,
    SafeDict,
    error_handler,
    safe_execute,
    validate_not_none,
    validate_range,
    validate_type,
)
from utils.i18n import I18nManager, init_i18n, set_language, t
from utils.storage import ConfigManager, SaveDataManager


class TestErrorHandler:
    """エラーハンドリング機能のテスト"""

    def test_型チェック_正常(self):
        """型チェックが正常に動作する"""
        result = validate_type(42, int, "test_value")
        assert result == 42

    def test_型チェック_エラー(self):
        """型チェックでエラーが発生する"""
        with pytest.raises(TypeError):
            validate_type("string", int, "test_value")

    def test_範囲チェック_正常(self):
        """範囲チェックが正常に動作する"""
        result = validate_range(5.0, min_val=0.0, max_val=10.0)
        assert result == 5.0

    def test_範囲チェック_最小値エラー(self):
        """範囲チェックで最小値エラーが発生する"""
        with pytest.raises(ValueError):
            validate_range(-1.0, min_val=0.0)

    def test_範囲チェック_最大値エラー(self):
        """範囲チェックで最大値エラーが発生する"""
        with pytest.raises(ValueError):
            validate_range(11.0, max_val=10.0)

    def test_Noneチェック_正常(self):
        """None チェックが正常に動作する"""
        result = validate_not_none("value")
        assert result == "value"

    def test_Noneチェック_エラー(self):
        """None チェックでエラーが発生する"""
        with pytest.raises(ValueError):
            validate_not_none(None)

    def test_安全実行_正常(self):
        """安全実行が正常に動作する"""

        def test_func(x, y):
            return x + y

        result = safe_execute(test_func, 1, 2)
        assert result == 3

    def test_安全実行_エラー時デフォルト値(self):
        """安全実行でエラー時にデフォルト値が返される"""

        def error_func():
            raise ValueError("テストエラー")

        result = safe_execute(error_func, default="default")
        assert result == "default"

    def test_エラーハンドラーデコレーター(self):
        """エラーハンドラーデコレーターが動作する"""

        @error_handler(default="error_occurred")
        def failing_function():
            raise RuntimeError("テストエラー")

        result = failing_function()
        assert result == "error_occurred"

    def test_SafeDict_正常アクセス(self):
        """SafeDict で正常にアクセスできる"""
        d = SafeDict({"key1": "value1", "key2": "value2"})
        assert d["key1"] == "value1"

    def test_SafeDict_存在しないキー(self):
        """SafeDict で存在しないキーにアクセスしてもエラーにならない"""
        d = SafeDict({"key1": "value1"})
        result = d["non_existent_key"]
        assert result is None

    def test_SafeDict_安全取得(self):
        """SafeDict で安全に値を取得できる"""
        d = SafeDict({"key1": "value1"})
        assert d.get_safe("key1") == "value1"
        assert d.get_safe("non_existent", "default") == "default"


class TestI18n:
    """国際化機能のテスト"""

    def test_I18nManager初期化(self):
        """I18nManager が正常に初期化される"""
        manager = I18nManager(Language.JA)
        assert manager.current_language == Language.JA
        assert manager.default_language == Language.JA

    def test_言語切り替え(self):
        """言語を切り替えできる"""
        manager = I18nManager()
        manager.set_language(Language.JA)
        assert manager.get_language() == Language.JA

    def test_翻訳追加と取得(self):
        """翻訳を追加して取得できる"""
        manager = I18nManager()
        manager.add_translation(Language.EN, "test_key", "Test Value")
        manager.add_translation(Language.JA, "test_key", "テスト値")

        # 英語
        manager.set_language(Language.EN)
        assert manager.translate("test_key") == "Test Value"

        # 日本語
        manager.set_language(Language.JA)
        assert manager.translate("test_key") == "テスト値"

    def test_存在しない翻訳キー(self):
        """存在しない翻訳キーはキー自体が返される"""
        manager = I18nManager()
        result = manager.translate("non_existent_key")
        assert result == "non_existent_key"

    def test_フォーマット付き翻訳(self):
        """フォーマット付きの翻訳ができる"""
        manager = I18nManager()
        manager.add_translation(Language.EN, "greeting", "Hello, {name}!")

        result = manager.translate("greeting", name="World")
        assert result == "Hello, World!"

    def test_フォーマットエラー時の処理(self):
        """フォーマットエラー時は元の文字列が返される"""
        manager = I18nManager()
        manager.add_translation(Language.EN, "bad_format", "Hello, {name}!")

        # 不正なフォーマット引数
        result = manager.translate("bad_format", invalid_key="value")
        assert result == "Hello, {name}!"

    def test_利用可能言語取得(self):
        """利用可能な言語を取得できる"""
        manager = I18nManager()
        manager.add_translation(Language.EN, "test", "test")
        manager.add_translation(Language.JA, "test", "テスト")

        available = manager.get_available_languages()
        assert Language.EN in available
        assert Language.JA in available

    def test_グローバル関数_init_i18n(self):
        """グローバル関数で国際化システムを初期化できる"""
        manager = init_i18n(Language.JA)
        assert manager.current_language == Language.JA

    def test_グローバル関数_set_language(self):
        """グローバル関数で言語を設定できる"""
        init_i18n()
        set_language(Language.JA)
        from utils.i18n import get_language

        assert get_language() == Language.JA


class TestStorage:
    """ストレージ機能のテスト"""

    def test_ConfigManager_設定保存と読み込み(self, テスト用設定マネージャー):
        """設定の保存と読み込みができる"""
        config = GameConfig(mode=GameMode.CUI, language=Language.JA)

        # 保存
        result = テスト用設定マネージャー.save_config(config)
        assert result is True

        # 読み込み
        loaded_config = テスト用設定マネージャー.load_config(GameConfig)
        assert loaded_config is not None
        assert loaded_config.mode == GameMode.CUI
        assert loaded_config.language == Language.JA

    def test_ConfigManager_存在チェック(self, テスト用設定マネージャー):
        """設定ファイルの存在チェックができる"""
        # 最初は存在しない
        assert テスト用設定マネージャー.config_exists() is False

        # 保存後は存在する
        config = GameConfig()
        テスト用設定マネージャー.save_config(config)
        assert テスト用設定マネージャー.config_exists() is True

    def test_ConfigManager_削除(self, テスト用設定マネージャー):
        """設定ファイルを削除できる"""
        # 設定を保存
        config = GameConfig()
        テスト用設定マネージャー.save_config(config)
        assert テスト用設定マネージャー.config_exists() is True

        # 削除
        result = テスト用設定マネージャー.delete_config()
        assert result is True
        assert テスト用設定マネージャー.config_exists() is False

    def test_ConfigManager_存在しないファイル読み込み(self, テスト用設定マネージャー):
        """存在しないファイルの読み込みはNoneを返す"""
        loaded_config = テスト用設定マネージャー.load_config(GameConfig)
        assert loaded_config is None

    def test_SaveDataManager_基本操作(self, テンポラリディレクトリ, monkeypatch):
        """セーブデータマネージャーの基本操作"""
        # テスト用ディレクトリを設定
        save_dir = テンポラリディレクトリ / "saves"
        save_dir.mkdir()

        def mock_get_save_data_dir():
            return save_dir

        monkeypatch.setattr("utils.storage.get_save_data_dir", mock_get_save_data_dir)

        manager = SaveDataManager("test_save")

        # データ保存
        from game.models import GameData

        data = GameData()
        data.play_time = 123.45

        result = manager.save_data(data)
        assert result is True

        # データ読み込み
        loaded_data = manager.load_data(GameData)
        assert loaded_data is not None
        assert loaded_data.play_time == 123.45

        # 存在チェック
        assert manager.save_exists() is True

        # 削除
        result = manager.delete_save()
        assert result is True
        assert manager.save_exists() is False

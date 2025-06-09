import pytest
from src.utils.i18n import get_text, load_translations, add_translation

def test_get_text_default_language():
    """デフォルト言語（日本語）でのテキスト取得をテスト"""
    text = get_text("game.title")
    assert text == "スネークゲーム"

def test_get_text_english():
    """英語でのテキスト取得をテスト"""
    text = get_text("game.title", "en")
    assert text == "Snake Game"

def test_get_text_nonexistent_key():
    """存在しないキーのテスト"""
    text = get_text("nonexistent.key")
    assert text == "nonexistent.key"

def test_get_text_nonexistent_language():
    """存在しない言語のテスト"""
    text = get_text("game.title", "fr")
    assert text == "game.title"

def test_load_translations():
    """翻訳データの読み込みをテスト"""
    translations = {
        "game.new": "新しいゲーム",
        "game.over": "ゲームオーバー"
    }
    load_translations("ja", translations)
    assert get_text("game.new") == "新しいゲーム"
    assert get_text("game.over") == "ゲームオーバー"

def test_add_translation():
    """新しい翻訳の追加をテスト"""
    add_translation("ja", "game.pause", "一時停止")
    assert get_text("game.pause") == "一時停止"

def test_add_translation_english():
    """英語での新しい翻訳の追加をテスト"""
    add_translation("en", "game.pause", "Pause")
    assert get_text("game.pause", "en") == "Pause"

def test_translation_persistence():
    """翻訳の永続性をテスト"""
    # 最初の翻訳を追加
    add_translation("ja", "game.test", "テスト")
    assert get_text("game.test") == "テスト"

    # 同じキーで新しい翻訳を追加
    add_translation("ja", "game.test", "新しいテスト")
    assert get_text("game.test") == "新しいテスト"

def test_multiple_languages():
    """複数言語の翻訳をテスト"""
    # 日本語の翻訳を追加
    add_translation("ja", "game.score", "スコア")
    assert get_text("game.score") == "スコア"

    # 英語の翻訳を追加
    add_translation("en", "game.score", "Score")
    assert get_text("game.score", "en") == "Score"

    # ドイツ語の翻訳を追加
    add_translation("de", "game.score", "Punktzahl")
    assert get_text("game.score", "de") == "Punktzahl" 
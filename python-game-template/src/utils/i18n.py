from typing import Dict, Any
import json
from pathlib import Path

# 言語ファイルのディレクトリ
LANG_DIR = Path("src/locales")
LANG_DIR.mkdir(exist_ok=True)

# デフォルト言語
DEFAULT_LANG = "en"

# 言語ファイルのパス
LANG_FILES = {
    "en": LANG_DIR / "en.json",
    "ja": LANG_DIR / "ja.json"
}

# 翻訳データ
TRANSLATIONS = {
    "en": {
        "welcome": "Python Game",
        "score": "Score: {score}",
        "game_over": "Game Over!",
        "player": "Player",
        "difficulty": "Difficulty",
        "enter_player_name": "Enter your name",
        "select_difficulty": "Select difficulty",
        "select_game_mode": "Select game mode",
        "custom_settings": "Do you want to customize game settings?",
        "board_width": "Enter board width",
        "board_height": "Enter board height",
        "time_limit": "Enter time limit (seconds)",
        "usage": "Python Game CLI",
        "help": "Use arrow keys to move, 'q' to quit, 'r' to reset",
        "error": "Error: {error}"
    },
    "ja": {
        "welcome": "Pythonゲーム",
        "score": "スコア: {score}",
        "game_over": "ゲームオーバー！",
        "player": "プレイヤー",
        "difficulty": "難易度",
        "enter_player_name": "プレイヤー名を入力してください",
        "select_difficulty": "難易度を選択してください",
        "select_game_mode": "ゲームモードを選択してください",
        "custom_settings": "ゲーム設定をカスタマイズしますか？",
        "board_width": "ボードの幅を入力してください",
        "board_height": "ボードの高さを入力してください",
        "time_limit": "制限時間（秒）を入力してください",
        "usage": "PythonゲームCLI",
        "help": "矢印キーで移動、'q'で終了、'r'でリセット",
        "error": "エラー: {error}"
    }
}

def load_translations() -> Dict[str, Dict[str, str]]:
    """言語ファイルを読み込む"""
    translations = {}
    for lang, file_path in LANG_FILES.items():
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                translations[lang] = json.load(f)
        else:
            # デフォルトの翻訳を保存
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(TRANSLATIONS[lang], f, ensure_ascii=False, indent=2)
            translations[lang] = TRANSLATIONS[lang]
    return translations

# 翻訳データの読み込み
TRANSLATIONS = load_translations()

def get_text(key: str, lang: str = "en", **kwargs) -> str:
    """
    指定された言語でテキストを取得する
    
    Args:
        key (str): 翻訳キー
        lang (str): 言語コード
        **kwargs: テキスト内の変数
        
    Returns:
        str: 翻訳されたテキスト
    """
    try:
        text = TRANSLATIONS[lang][key]
        return text.format(**kwargs)
    except KeyError:
        # 翻訳が見つからない場合は英語をフォールバック
        try:
            text = TRANSLATIONS["en"][key]
            return text.format(**kwargs)
        except KeyError:
            return key 
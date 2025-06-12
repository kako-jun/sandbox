"""
フォント管理ユーティリティ

OSにプリインストールされた等幅フォントを検出し、日本語表示に適用
"""

import platform
from typing import List, Optional

import pygame  # type: ignore


def get_system_monospace_fonts() -> List[str]:
    """システムで利用可能な等幅フォントのリストを取得

    Returns:
        フォント名のリスト（優先順）
    """
    system = platform.system()

    if system == "Windows":
        return [
            "MS Gothic",  # 日本語対応の等幅フォント
            "Consolas",  # 英数字用の美しい等幅フォント
            "Courier New",  # 標準的な等幅フォント
            "MS UI Gothic",  # 日本語UI用フォント
            "Lucida Console",  # Windows標準の等幅フォント
        ]
    elif system == "Darwin":  # macOS
        return [
            "Osaka-Mono",  # 日本語対応の等幅フォント
            "Menlo",  # macOS標準の等幅フォント
            "Monaco",  # 古いmacOS標準フォント
            "Courier New",  # 標準的な等幅フォント
            "Hiragino Sans",  # 日本語対応フォント
        ]
    else:  # Linux
        return [
            "DejaVu Sans Mono",  # Linux標準の等幅フォント
            "Liberation Mono",  # オープンソースの等幅フォント
            "Courier New",  # 標準的な等幅フォント
            "Noto Sans Mono CJK JP",  # Google Notoフォント（日本語）
            "Takao Gothic",  # 日本語対応フォント
        ]


def find_best_font(size: int = 16) -> Optional[pygame.font.Font]:
    """最適なフォントを検索して取得

    Args:
        size: フォントサイズ

    Returns:
        利用可能な最適なフォント、見つからない場合はNone
    """
    font_candidates = get_system_monospace_fonts()

    # システムで利用可能なフォントを取得
    available_fonts = pygame.font.get_fonts()

    # 候補フォントを順番に試す
    for font_name in font_candidates:
        # フォント名を小文字に変換してチェック（Pygameは小文字を要求）
        font_name_lower = font_name.lower().replace(" ", "").replace("-", "")

        if font_name_lower in available_fonts:
            try:
                font = pygame.font.SysFont(font_name, size)
                # 日本語文字が表示できるかテスト
                if test_font_japanese_support(font):
                    print(f"[FONT] Using system font: {font_name}")
                    return font
            except Exception:
                continue

    # システムフォントが見つからない場合はデフォルトフォントを使用
    try:
        default_font = pygame.font.Font(None, size)
        print(f"[FONT] Using default font (size: {size})")
        return default_font
    except Exception:
        return None


def test_font_japanese_support(font: pygame.font.Font) -> bool:
    """フォントが日本語をサポートしているかテスト

    Args:
        font: テストするフォント

    Returns:
        日本語サポートがある場合True
    """
    try:
        # 簡単な日本語文字でテスト
        test_text = "あいう"
        surface = font.render(test_text, True, (255, 255, 255))
        # レンダリングが成功し、サイズが0でなければOK
        return surface.get_width() > 0 and surface.get_height() > 0
    except Exception:
        return False


def get_font_info() -> str:
    """現在利用可能なフォント情報を取得

    Returns:
        フォント情報文字列
    """
    system = platform.system()
    available_fonts = pygame.font.get_fonts()
    system_fonts = get_system_monospace_fonts()

    info = f"System: {system}\n"
    info += f"Available fonts: {len(available_fonts)}\n"
    info += f"Monospace candidates: {', '.join(system_fonts[:3])}"

    return info

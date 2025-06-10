import os
import sys
import re
import html
from typing import Optional, Dict, Any, List, Tuple, Union, Set

# 権限の定義
PERMISSIONS: Dict[str, Set[str]] = {"admin": {"read", "write", "delete"}, "user": {"read"}, "guest": set()}


def validate_input(value: str) -> bool:
    """
    入力値を検証する

    Args:
        value (str): 検証する値

    Returns:
        bool: 検証結果
    """
    # 基本的なXSS対策
    if "<script>" in value.lower():
        return False
    if "javascript:" in value.lower():
        return False
    if "onerror=" in value.lower():
        return False
    if "onload=" in value.lower():
        return False

    # 長すぎる空白文字列のチェック（100文字以上の空白のみは無効）
    if len(value.strip()) == 0 and len(value) >= 100:
        return False

    return True


def sanitize_output(value: str) -> str:
    """
    出力値をサニタイズする

    Args:
        value (str): サニタイズする値

    Returns:
        str: サニタイズされた値
    """
    # HTMLエスケープを適用
    sanitized = html.escape(value)
    # 改行文字とタブ文字を空白に置換
    sanitized = sanitized.replace("\n", " ")
    sanitized = sanitized.replace("\t", " ")
    return sanitized


def check_permissions(role: str, permission: str) -> bool:
    """
    権限をチェックする

    Args:
        role (str): ユーザーの役割
        permission (str): 必要な権限

    Returns:
        bool: 権限があるかどうか
    """
    if role not in PERMISSIONS:
        return False
    return permission in PERMISSIONS[role]

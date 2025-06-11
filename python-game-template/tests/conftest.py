"""
pytest設定ファイル

テスト全体で共有するフィクスチャを定義
"""

import os
import tempfile
from pathlib import Path

import pytest

import sys
from pathlib import Path

# Add src directory to Python path for tests
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from game.models import GameConfig, GameMode, Language
from utils.storage import ConfigManager


@pytest.fixture
def テンポラリディレクトリ():
    """テンポラリディレクトリを作成"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)


@pytest.fixture
def テスト用ゲーム設定():
    """テスト用のゲーム設定を作成"""
    return GameConfig(mode=GameMode.CLI, language=Language.JAPANESE, debug=True, fps=30)


@pytest.fixture
def テスト用設定マネージャー(テンポラリディレクトリ, monkeypatch):
    """テスト用の設定マネージャーを作成"""
    # アプリデータディレクトリを一時ディレクトリに変更
    config_dir = テンポラリディレクトリ / "config"
    config_dir.mkdir()

    def mock_get_config_dir():
        return config_dir

    monkeypatch.setattr("utils.storage.get_config_dir", mock_get_config_dir)

    return ConfigManager("test_config")


@pytest.fixture(autouse=True)
def 環境変数クリーンアップ(monkeypatch):
    """テスト間での環境変数の干渉を防ぐ"""
    # テスト用の環境変数を設定
    monkeypatch.setenv("PYTHONPATH", ".")

    # 他のアプリケーションに影響を与えないよう、データディレクトリを分離
    test_data_dir = Path(tempfile.gettempdir()) / "python_game_template_test"
    monkeypatch.setenv("GAME_DATA_DIR", str(test_data_dir))

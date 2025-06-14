"""
pytest設定ファイル

テスト全体で共有するフィクスチャを定義
"""

import os
import sys
import tempfile
from pathlib import Path

import pytest

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
    return GameConfig(mode=GameMode.CUI, language=Language.JA, debug=True, fps=30)


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


@pytest.fixture(autouse=True)
def pygame_headless_setup():
    """PyGameをヘッドレスモードで設定（全テストで自動適用）"""
    # SDL_VIDEODRIVERを'dummy'に設定してヘッドレス実行
    old_driver = os.environ.get("SDL_VIDEODRIVER", None)
    os.environ["SDL_VIDEODRIVER"] = "dummy"

    # DISPLAYを無効化（Linux環境対応）
    old_display = os.environ.get("DISPLAY", None)
    if "DISPLAY" in os.environ:
        del os.environ["DISPLAY"]

    yield

    # 環境変数を復元
    if old_driver is not None:
        os.environ["SDL_VIDEODRIVER"] = old_driver
    else:
        os.environ.pop("SDL_VIDEODRIVER", None)

    if old_display is not None:
        os.environ["DISPLAY"] = old_display
    
    # Linuxでのターミナル設定リセット（テスト後の改行問題対策）
    if os.name != "nt":
        try:
            import subprocess
            # より包括的なリセット
            subprocess.run(["stty", "onlcr", "opost", "echo"], check=False, capture_output=True)
            # 保存された設定がある場合は復元
            if '_original_stty_settings' in globals():
                subprocess.run(["stty", globals()['_original_stty_settings']], check=False, capture_output=True)
        except (subprocess.SubprocessError, FileNotFoundError):
            pass


@pytest.fixture
def mock_process_lock_dir(テンポラリディレクトリ, monkeypatch):
    """プロセスロック用の一時ディレクトリを作成"""
    lock_dir = テンポラリディレクトリ / "python_game_locks"
    lock_dir.mkdir()

    def mock_gettempdir():
        return str(テンポラリディレクトリ)

    monkeypatch.setattr("tempfile.gettempdir", mock_gettempdir)
    yield lock_dir


@pytest.fixture
def suppress_pygame_output(monkeypatch):
    """PyGameの出力を抑制"""
    import sys
    from io import StringIO

    # 標準出力をキャプチャ
    captured_output = StringIO()
    monkeypatch.setattr(sys, "stdout", captured_output)

    yield captured_output


def pytest_configure(config):
    """pytest設定時の処理"""
    # PyGameの初期化メッセージを抑制
    os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

    # テスト実行時のディスプレイ設定
    if "DISPLAY" not in os.environ and os.name != "nt":
        os.environ["SDL_VIDEODRIVER"] = "dummy"
    
    # テスト開始前にLinuxターミナル設定を保存
    if os.name != "nt":
        try:
            import subprocess
            # 現在のstty設定を保存
            result = subprocess.run(["stty", "-g"], capture_output=True, text=True, check=False)
            if result.returncode == 0:
                # グローバル変数として保存
                globals()['_original_stty_settings'] = result.stdout.strip()
        except (subprocess.SubprocessError, FileNotFoundError):
            pass


def pytest_unconfigure(config):
    """pytest終了時の処理"""
    # Linuxターミナル設定を元に戻す
    if os.name != "nt":
        try:
            import subprocess
            # 保存された設定がある場合は復元
            if '_original_stty_settings' in globals():
                subprocess.run(["stty", globals()['_original_stty_settings']], check=False, capture_output=True)
            else:
                # フォールバック：基本的な設定をリセット
                subprocess.run(["stty", "onlcr", "opost", "echo"], check=False, capture_output=True)
        except (subprocess.SubprocessError, FileNotFoundError):
            pass


def pytest_collection_modifyitems(config, items):
    """テスト収集時の処理"""
    # GUIテストにマーカーを追加
    for item in items:
        if "gui" in item.nodeid.lower() or "pygame" in item.nodeid.lower():
            item.add_marker(pytest.mark.gui)
        if "process_lock" in item.nodeid.lower():
            item.add_marker(pytest.mark.process_lock)

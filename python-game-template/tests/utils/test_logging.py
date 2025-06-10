import os
import sys
import platform
import tempfile
from pathlib import Path
from unittest.mock import patch, mock_open, MagicMock
import pytest
from src.utils.logging import get_log_dir, setup_logger


def test_get_log_dir_windows():
    """Windowsでのログディレクトリの取得をテスト"""
    test_local_app_data = "C:\\Users\\Test\\AppData\\Local"
    with patch("platform.system", return_value="Windows"), patch.dict(
        os.environ, {"LOCALAPPDATA": test_local_app_data}
    ), patch("pathlib.Path.mkdir") as mock_mkdir:
        log_dir = get_log_dir()
        expected = Path(test_local_app_data) / "python-game-template" / "logs"
        assert log_dir == expected
        mock_mkdir.assert_called_once_with(parents=True, exist_ok=True)


def test_get_log_dir_macos():
    """macOSでのログディレクトリの取得をテスト"""
    with patch("platform.system", return_value="Darwin"):
        log_dir = get_log_dir()
        expected = Path.home() / "Library" / "Logs" / "python-game-template" / "logs"
        assert log_dir == expected


def test_get_log_dir_linux():
    """Linuxでのログディレクトリの取得をテスト"""
    with patch("platform.system", return_value="Linux"), patch.dict(
        os.environ, {"XDG_DATA_HOME": "/home/test/.local/share"}
    ), patch("pathlib.Path.mkdir"):
        log_dir = get_log_dir()
        expected = Path("/home/test/.local/share") / "python-game-template" / "logs"
        assert log_dir == expected


def test_get_log_dir_linux_fallback():
    """Linuxでのフォールバックログディレクトリの取得をテスト"""
    with patch("platform.system", return_value="Linux"), patch.dict(os.environ, {}, clear=True), patch(
        "pathlib.Path.mkdir"
    ), patch("pathlib.Path.home", return_value=Path("/home/test")):
        log_dir = get_log_dir()
        expected = Path("/home/test") / ".local" / "share" / "python-game-template" / "logs"
        assert log_dir == expected


def test_get_log_dir_custom_env():
    """環境変数によるカスタムログディレクトリの取得をテスト"""
    with patch.dict(os.environ, {"LOG_DIR": "/custom/log/dir"}):
        log_dir = get_log_dir()
        assert log_dir == Path("/custom/log/dir")


def test_get_log_dir_permission_error():
    """権限エラー時のフォールバックをテスト"""
    with patch("platform.system", return_value="Linux"), patch("pathlib.Path.mkdir") as mock_mkdir, patch.dict(
        os.environ, {"TEMP": "/tmp"}
    ), patch("logging.warning"):
        # 最初のmkdirでPermissionError, 2回目は成功
        mock_mkdir.side_effect = [PermissionError(), None]
        log_dir = get_log_dir()
        assert log_dir == Path("/tmp") / "python-game-template" / "logs"
        assert mock_mkdir.call_count == 2


def test_setup_logger_basic():
    """基本的なロガー設定をテスト"""
    with patch("logging.getLogger") as mock_get_logger:
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        logger = setup_logger("test_logger")
        assert logger == mock_logger
        mock_logger.setLevel.assert_called_once_with(20)  # logging.INFO
        assert mock_logger.addHandler.call_count == 1  # コンソールハンドラーのみ


def test_setup_logger_with_file():
    """ファイル出力付きのロガー設定をテスト"""
    with patch("logging.getLogger") as mock_get_logger, patch(
        "src.utils.logging.RotatingFileHandler"
    ) as mock_file_handler, patch("logging.StreamHandler") as mock_stream_handler:
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        mock_handler = MagicMock()
        mock_file_handler.return_value = mock_handler
        mock_stream_handler.return_value = MagicMock()

        log_file = Path("/tmp/test.log")
        logger = setup_logger("test_logger", log_file=log_file)
        assert logger == mock_logger
        mock_logger.setLevel.assert_called_once_with(20)  # logging.INFO
        # ファイルハンドラーが作成されることを確認
        mock_file_handler.assert_called_once()
        # addHandlerは2回呼ばれる（コンソールハンドラーとファイルハンドラー）
        assert mock_logger.addHandler.call_count == 2


def test_setup_logger_file_error():
    """ファイルハンドラー設定エラー時の動作をテスト"""
    with patch("logging.getLogger") as mock_get_logger, patch(
        "logging.handlers.RotatingFileHandler", side_effect=PermissionError
    ), patch("logging.warning"):
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        logger = setup_logger("test_logger", log_file=Path("/invalid/path/test.log"))
        assert logger == mock_logger
        mock_logger.setLevel.assert_called_once_with(20)  # logging.INFO
        assert mock_logger.addHandler.call_count == 1  # コンソールハンドラーのみ

"""
プロセスロック機能のテスト

多重起動防止、PID検証、タイムスタンプ検証などのテスト
"""

import os
import tempfile
import time
from pathlib import Path
from unittest.mock import Mock, mock_open, patch

import pytest

from utils.process_lock import (
    ProcessLock,
    check_single_instance,
    force_cleanup_locks,
    get_process_locks,
    is_lock_file_valid,
)


class TestProcessLock:
    """プロセスロック機能のテスト"""

    def test_process_lock_initialization(self):
        """プロセスロックの初期化をテストする"""
        lock = ProcessLock("test_game", "gui")

        assert lock.lock_name == "test_game"
        assert lock.mode == "gui"
        assert lock.lock_file is None
        assert lock.file_handle is None

    def test_process_running_check_with_psutil(self):
        """psutilが利用可能な場合のプロセス存在確認をテストする"""
        """psutilが利用可能な場合のプロセス存在確認をテストする"""
        lock = ProcessLock("test_game", "gui")

        with patch("utils.process_lock.PSUTIL_AVAILABLE", True):
            with patch("utils.process_lock.psutil.pid_exists") as mock_pid_exists:
                mock_pid_exists.return_value = True
                assert lock._is_process_running(1234) is True

                mock_pid_exists.return_value = False
                assert lock._is_process_running(1234) is False

    def test_プロセス存在確認_Windows代替手段(self):
        """Windows環境での代替プロセス存在確認をテストする"""
        lock = ProcessLock("test_game", "gui")

        with patch("utils.process_lock.PSUTIL_AVAILABLE", False):
            with patch("os.name", "nt"):
                with patch("subprocess.run") as mock_run:
                    # プロセスが存在する場合
                    mock_run.return_value.stdout = "PID: 1234"
                    assert lock._is_process_running(1234) is True

                    # プロセスが存在しない場合
                    mock_run.return_value.stdout = "No tasks are running"
                    assert lock._is_process_running(1234) is False

    def test_プロセス存在確認_Unix代替手段(self):
        """Unix環境での代替プロセス存在確認をテストする"""
        lock = ProcessLock("test_game", "gui")

        with patch("utils.process_lock.PSUTIL_AVAILABLE", False):
            with patch("os.name", "posix"):
                with patch("os.kill") as mock_kill:
                    # プロセスが存在する場合
                    mock_kill.return_value = None
                    assert lock._is_process_running(1234) is True

                    # プロセスが存在しない場合
                    mock_kill.side_effect = OSError()
                    assert lock._is_process_running(1234) is False

    def test_ロックファイル有効性確認_有効なファイル(self):
        """有効なロックファイルの確認をテストする"""
        lock = ProcessLock("test_game", "gui")

        # 有効なロックファイルの内容
        lock_content = f"PID: {os.getpid()}\nMode: gui\nStarted: {time.ctime()}\n"

        with patch("builtins.open", mock_open(read_data=lock_content)):
            with patch.object(lock, "_is_process_running", return_value=True):
                result = lock._is_lock_file_valid(Path("test.lock"))
                assert result is True

    def test_ロックファイル有効性確認_無効なPID(self):
        """無効なPIDを持つロックファイルの確認をテストする"""
        lock = ProcessLock("test_game", "gui")

        # 無効なPIDのロックファイル内容
        lock_content = "PID: 99999\nMode: gui\nStarted: Mon Jan  1 00:00:00 2024\n"

        with patch("builtins.open", mock_open(read_data=lock_content)):
            with patch.object(lock, "_is_process_running", return_value=False):
                result = lock._is_lock_file_valid(Path("test.lock"))
                assert result is False

    def test_ロックファイル有効性確認_古いタイムスタンプ(self):
        """古いタイムスタンプを持つロックファイルの確認をテストする"""
        lock = ProcessLock("test_game", "gui")

        # 25時間前のタイムスタンプ（24時間を超過）
        old_time = time.ctime(time.time() - 25 * 60 * 60)
        lock_content = f"PID: {os.getpid()}\nMode: gui\nStarted: {old_time}\n"

        with patch("builtins.open", mock_open(read_data=lock_content)):
            with patch.object(lock, "_is_process_running", return_value=True):
                result = lock._is_lock_file_valid(Path("test.lock"))
                assert result is False

    def test_ロック取得_成功(self):
        """ロック取得の成功をテストする"""
        lock = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                result = lock.acquire()
                assert result is True
                assert lock.lock_file is not None
                assert lock.file_handle is not None

                # ロックファイルが作成されていることを確認
                assert lock.lock_file.exists()

                # ロックファイルの内容を確認
                with open(lock.lock_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    assert f"PID: {os.getpid()}" in content
                    assert "Mode: gui" in content

                # クリーンアップ
                lock.release()

    def test_ロック取得_既存ロック存在(self):
        """既存ロックが存在する場合のロック取得をテストする"""
        lock1 = ProcessLock("test_game", "gui")
        lock2 = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                # 最初のロックを取得
                result1 = lock1.acquire()
                assert result1 is True

                # 2番目のロック取得は失敗するはず
                result2 = lock2.acquire()
                assert result2 is False

                # クリーンアップ
                lock1.release()

    def test_ロック解放(self):
        """ロック解放をテストする"""
        lock = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                # ロックを取得
                lock.acquire()
                lock_file_path = lock.lock_file

                # ロックファイルが存在することを確認
                assert lock_file_path.exists()

                # ロックを解放
                lock.release()

                # ロックファイルが削除されていることを確認
                assert not lock_file_path.exists()
                assert lock.file_handle is None

    def test_コンテキストマネージャー_成功(self):
        """コンテキストマネージャーの成功ケースをテストする"""
        lock = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                with lock:
                    assert lock.lock_file is not None
                    assert lock.file_handle is not None
                    assert lock.lock_file.exists()

                # withブロックを出た後、ロックが解放されているはず
                assert not lock.lock_file.exists()

    def test_コンテキストマネージャー_ロック取得失敗(self):
        """コンテキストマネージャーでロック取得失敗をテストする"""
        lock1 = ProcessLock("test_game", "gui")
        lock2 = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                with lock1:
                    # 同じロックを取得しようとすると例外が発生するはず
                    with pytest.raises(
                        RuntimeError, match="Could not acquire process lock"
                    ):
                        with lock2:
                            pass


class TestSingleInstanceCheck:
    """単一インスタンスチェック機能のテスト"""

    def test_単一インスタンスチェック_ロックなし(self):
        """ロックファイルが存在しない場合のチェックをテストする"""
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                result = check_single_instance("gui")
                assert result is True

    def test_単一インスタンスチェック_無効ロックあり(self):
        """無効なロックファイルが存在する場合のチェックをテストする"""
        with tempfile.TemporaryDirectory() as temp_dir:
            lock_dir = Path(temp_dir) / "python_game_locks"
            lock_dir.mkdir()
            lock_file = lock_dir / "python_game_gui.lock"

            # 無効なロックファイルを作成（存在しないPID）
            with open(lock_file, "w", encoding="utf-8") as f:
                f.write("PID: 99999\nMode: gui\nStarted: Mon Jan  1 00:00:00 2024\n")

            with patch("tempfile.gettempdir", return_value=temp_dir):
                with patch(
                    "utils.process_lock.ProcessLock._is_process_running",
                    return_value=False,
                ):
                    result = check_single_instance("gui")
                    assert result is True

    def test_単一インスタンスチェック_両方モード(self):
        """bothモードのチェックをテストする"""
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                result = check_single_instance("both")
                assert result is True

    def test_プロセスロック取得(self):
        """プロセスロック取得機能をテストする"""
        # 単一モード
        locks = get_process_locks("gui")
        assert len(locks) == 1
        assert locks[0].mode == "gui"

        # 両方モード
        locks = get_process_locks("both")
        assert len(locks) == 2
        assert locks[0].mode == "cui"
        assert locks[1].mode == "gui"

    def test_強制クリーンアップ(self):
        """強制ロックファイルクリーンアップをテストする"""
        with tempfile.TemporaryDirectory() as temp_dir:
            lock_dir = Path(temp_dir) / "python_game_locks"
            lock_dir.mkdir()

            # テスト用ロックファイルを作成
            lock_files = [
                lock_dir / "python_game_gui.lock",
                lock_dir / "python_game_cui.lock",
            ]

            for lock_file in lock_files:
                with open(lock_file, "w", encoding="utf-8") as f:
                    f.write(
                        "PID: 12345\nMode: test\nStarted: Mon Jan  1 00:00:00 2024\n"
                    )

            # すべてのファイルが存在することを確認
            for lock_file in lock_files:
                assert lock_file.exists()

            with patch("tempfile.gettempdir", return_value=temp_dir):
                force_cleanup_locks()

            # ファイルが削除されていることを確認
            for lock_file in lock_files:
                assert not lock_file.exists()


class TestPublicFunctions:
    """公開関数のテスト"""

    def test_ロックファイル有効性確認_公開関数(self):
        """公開関数のロックファイル有効性確認をテストする"""
        # 有効なロックファイルの内容
        lock_content = f"PID: {os.getpid()}\nMode: gui\nStarted: {time.ctime()}\n"

        with patch("builtins.open", mock_open(read_data=lock_content)):
            with patch(
                "utils.process_lock.ProcessLock._is_process_running", return_value=True
            ):
                result = is_lock_file_valid(Path("test.lock"))
                assert result is True

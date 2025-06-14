"""
簡単なプロセスロック機能のテスト

基本的な機能のみをテストする
"""

import os
import tempfile
import time
from pathlib import Path
from unittest.mock import Mock, patch

import pytest

from utils.process_lock import ProcessLock, check_single_instance


class TestBasicProcessLock:
    """基本的なプロセスロック機能のテスト"""

    def test_lock_initialization(self):
        """プロセスロックの初期化をテストする"""
        lock = ProcessLock("test_game", "gui")

        assert lock.lock_name == "test_game"
        assert lock.mode == "gui"
        assert lock.lock_file is None
        assert lock.file_handle is None

    def test_single_instance_check_no_locks(self):
        """ロックファイルが存在しない場合のチェックをテストする"""
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                result = check_single_instance("gui")
                assert result is True

    def test_lock_acquire_success(self):
        """ロック取得の成功をテストする"""
        lock = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                result = lock.acquire()
                assert result is True
                assert lock.lock_file is not None
                assert lock.file_handle is not None

                # クリーンアップ
                lock.release()

    def test_lock_release(self):
        """ロック解放をテストする"""
        lock = ProcessLock("test_game", "gui")

        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                # ロックを取得
                result = lock.acquire()
                assert result is True
                lock_file_path = lock.lock_file

                # ロックファイルが存在することを確認
                assert lock_file_path is not None
                assert lock_file_path.exists()

                # ロックを解放
                lock.release()

                # ロックファイルが削除されていることを確認
                assert not lock_file_path.exists()
                assert lock.file_handle is None

    def test_process_running_check_public_interface(self):
        """プロセス存在確認の公開インターフェースをテストする"""
        lock = ProcessLock("test_game", "gui")

        # 現在のプロセスのPIDでロックファイルを作成
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch("tempfile.gettempdir", return_value=temp_dir):
                current_pid = os.getpid()
                
                # ロックを取得して、実在するPIDが書き込まれることを確認
                result = lock.acquire()
                assert result is True
                
                # ロックファイルにPIDが書き込まれていることを確認
                if lock.lock_file and lock.lock_file.exists():
                    with open(lock.lock_file, 'r') as f:
                        content = f.read().strip()
                        # PIDが含まれていることを確認（JSON形式）
                        assert str(current_pid) in content
                
                # クリーンアップ
                lock.release()

"""
プロセス管理とロック機能

アプリケーションの多重起動を防止し、適切なプロセス間管理を実装
"""

import os
import tempfile
import time
from pathlib import Path
from typing import Optional

# psutilが利用可能かチェック
try:
    import psutil

    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False


class ProcessLock:
    """プロセスロック管理クラス（改良版）"""

    def __init__(self, lock_name: str, mode: str = "any"):
        """初期化

        Args:
            lock_name: ロックファイル名
            mode: ロックモード ('cui', 'gui', 'any')
        """
        self.lock_name = lock_name
        self.mode = mode
        self.lock_file: Optional[Path] = None
        self.file_handle = None

    def _is_process_running(self, pid: int) -> bool:
        """指定されたPIDのプロセスが実行中かチェック

        Args:
            pid: プロセスID

        Returns:
            プロセスが実行中かどうか
        """
        if PSUTIL_AVAILABLE:
            try:
                return psutil.pid_exists(pid)
            except Exception:
                pass

        # psutilが利用できない場合の代替手段
        try:
            if os.name == "nt":  # Windows
                import subprocess

                result = subprocess.run(
                    ["tasklist", "/FI", f"PID eq {pid}"],
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                return str(pid) in result.stdout
            else:  # Unix系
                try:
                    os.kill(pid, 0)  # シグナル0でプロセス存在チェック
                    return True
                except OSError:
                    return False
        except Exception:
            pass

        return False

    def _is_lock_file_valid(self, lock_file: Path) -> bool:
        """ロックファイルが有効かチェック

        Args:
            lock_file: ロックファイルのパス

        Returns:
            ロックファイルが有効かどうか
        """
        try:
            with open(lock_file, "r", encoding="utf-8") as f:
                lines = f.readlines()

            pid_line = None
            started_line = None

            for line in lines:
                line = line.strip()
                if line.startswith("PID:"):
                    pid_line = line
                elif line.startswith("Started:"):
                    started_line = line

            if not pid_line:
                return False

            # PIDを抽出
            try:
                pid = int(pid_line.split(":")[1].strip())
            except (ValueError, IndexError):
                return False

            # プロセスが実行中かチェック
            if not self._is_process_running(pid):
                print(
                    f"[LOCK] Stale lock file detected (PID {pid} not running), removing..."
                )
                return False

            # タイムスタンプチェック（24時間以上古い場合は無効とする）
            if started_line:
                try:
                    timestamp_str = started_line.split(":", 1)[1].strip()
                    lock_time = time.mktime(time.strptime(timestamp_str))
                    current_time = time.time()
                    if current_time - lock_time > 24 * 60 * 60:  # 24時間
                        print(
                            "[LOCK] Old lock file detected (older than 24 hours), removing..."
                        )
                        return False
                except Exception:
                    pass

            return True

        except Exception:
            return False

    def acquire(self) -> bool:
        """ロックを取得

        Returns:
            ロック取得に成功した場合True
        """
        # ロックファイルのパスを決定
        if os.name == "nt":  # Windows
            lock_dir = Path(tempfile.gettempdir()) / "python_game_locks"
        else:  # Unix系
            lock_dir = Path("/tmp/python_game_locks")

        lock_dir.mkdir(exist_ok=True)
        self.lock_file = lock_dir / f"{self.lock_name}_{self.mode}.lock"

        try:
            # ロックファイルが既に存在するかチェック
            if self.lock_file.exists():
                # 既存のロックファイルが有効かチェック
                if self._is_lock_file_valid(self.lock_file):
                    # 有効なロックファイルが存在
                    return False
                else:
                    # 無効なロックファイルなので削除
                    try:
                        self.lock_file.unlink()
                    except Exception:
                        pass

            # ロックファイルを作成
            self.file_handle = open(self.lock_file, "w", encoding="utf-8")

            # プロセス情報を書き込み
            self.file_handle.write(f"PID: {os.getpid()}\n")
            self.file_handle.write(f"Mode: {self.mode}\n")
            self.file_handle.write(f"Started: {time.ctime()}\n")
            self.file_handle.flush()

            print(f"[LOCK] Process lock acquired: {self.mode} mode")
            return True

        except (IOError, OSError) as e:
            if self.file_handle:
                self.file_handle.close()
                self.file_handle = None
            print(f"[LOCK] Lock acquisition failed: {e}")
            return False

    def release(self) -> None:
        """ロックを解放"""
        if self.file_handle:
            try:
                self.file_handle.close()

                if self.lock_file and self.lock_file.exists():
                    self.lock_file.unlink()

                print(f"[LOCK] Process lock released: {self.mode} mode")

            except Exception as e:
                print(f"[LOCK] Error releasing lock: {e}")
            finally:
                self.file_handle = None

    def __enter__(self):
        """コンテキストマネージャーのエントリー"""
        if not self.acquire():
            raise RuntimeError(f"Could not acquire process lock for {self.mode} mode")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """コンテキストマネージャーの終了"""
        self.release()


def is_lock_file_valid(lock_file: Path) -> bool:
    """ロックファイルが有効かチェック（公開関数）

    Args:
        lock_file: ロックファイルのパス

    Returns:
        ロックファイルが有効かどうか
    """
    dummy_lock = ProcessLock("dummy", "dummy")
    return dummy_lock._is_lock_file_valid(lock_file)


def check_single_instance(mode: str) -> bool:
    """単一インスタンスチェック

    Args:
        mode: アプリケーションモード ('cui', 'gui', 'both')

    Returns:
        起動可能な場合True
    """
    if mode == "both":
        # GUI, CUIの両方をチェック
        cui_lock = ProcessLock("python_game", "cui")
        gui_lock = ProcessLock("python_game", "gui")

        # 既存のロックファイルの存在をチェック（改良版）
        if os.name == "nt":  # Windows
            lock_dir = Path(tempfile.gettempdir()) / "python_game_locks"
        else:  # Unix系
            lock_dir = Path("/tmp/python_game_locks")

        cui_lock_file = lock_dir / "python_game_cui.lock"
        gui_lock_file = lock_dir / "python_game_gui.lock"
        # ロックファイルが存在し、かつ有効な場合のみ起動不可
        if cui_lock_file.exists() and is_lock_file_valid(cui_lock_file):
            return False
        if gui_lock_file.exists() and is_lock_file_valid(gui_lock_file):
            return False

        return True
    else:
        # 単一モードの場合も同様に改良
        if os.name == "nt":  # Windows
            lock_dir = Path(tempfile.gettempdir()) / "python_game_locks"
        else:  # Unix系
            lock_dir = Path("/tmp/python_game_locks")

        # 全てのモードのロックファイルをチェック（相互排他）
        cui_lock_file = lock_dir / "python_game_cui.lock"
        gui_lock_file = lock_dir / "python_game_gui.lock"

        cui_lock = ProcessLock("python_game", "cui")
        gui_lock = ProcessLock("python_game", "gui")
        # どちらかのロックファイルが有効な場合は起動不可
        if cui_lock_file.exists() and is_lock_file_valid(cui_lock_file):
            return False
        if gui_lock_file.exists() and is_lock_file_valid(gui_lock_file):
            return False

        return True


def get_process_locks(mode: str) -> list[ProcessLock]:
    """指定モードに対応するプロセスロックのリストを取得

    Args:
        mode: アプリケーションモード

    Returns:
        プロセスロックのリスト
    """
    if mode == "both":
        return [ProcessLock("python_game", "cui"), ProcessLock("python_game", "gui")]
    else:
        return [ProcessLock("python_game", mode)]


def force_cleanup_locks() -> None:
    """強制的に全てのロックファイルを削除

    注意: この関数は緊急時のみ使用してください
    """
    if os.name == "nt":  # Windows
        lock_dir = Path(tempfile.gettempdir()) / "python_game_locks"
    else:  # Unix系
        lock_dir = Path("/tmp/python_game_locks")

    if lock_dir.exists():
        try:
            for lock_file in lock_dir.glob("python_game_*.lock"):
                lock_file.unlink()
                print(f"[LOCK] Removed lock file: {lock_file}")
            print("[LOCK] All lock files removed successfully")
        except Exception as e:
            print(f"[LOCK] Error during cleanup: {e}")

"""
プロセス管理とロック機能

アプリケーションの多重起動を防止し、適切なプロセス間管理を実装
"""

import os
import tempfile
import time
from pathlib import Path
from typing import Optional


class ProcessLock:
    """プロセスロック管理クラス（簡易版）"""

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
                try:
                    with open(self.lock_file, "r") as f:
                        content = f.read()
                        if "PID:" in content:
                            # 有効なロックファイルが存在
                            return False
                except Exception:
                    # 読み込めない場合は古いファイルなので削除
                    self.lock_file.unlink()

            # ロックファイルを作成
            self.file_handle = open(self.lock_file, "w")

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


def check_single_instance(mode: str) -> bool:
    """単一インスタンスチェック

    Args:
        mode: アプリケーションモード ('cui', 'gui', 'both')

    Returns:
        起動可能な場合True
    """
    import os
    import tempfile
    from pathlib import Path
    
    if os.name == "nt":  # Windows
        lock_dir = Path(tempfile.gettempdir()) / "python_game_locks"
    else:  # Unix系
        lock_dir = Path("/tmp/python_game_locks")
    
    # 全てのモードのロックファイルをチェック
    cui_lock_file = lock_dir / "python_game_cui.lock"
    gui_lock_file = lock_dir / "python_game_gui.lock"
    
    if mode == "both":
        # 両方モードの場合は、どちらのロックファイルも存在しないことが必要
        return not (cui_lock_file.exists() or gui_lock_file.exists())
    elif mode == "cui":
        # CUIモードの場合は、CUIまたはGUIが既に起動していないことを確認
        return not (cui_lock_file.exists() or gui_lock_file.exists())
    elif mode == "gui":
        # GUIモードの場合は、GUIまたはCUIが既に起動していないことを確認
        return not (gui_lock_file.exists() or cui_lock_file.exists())
    else:
        # 不明なモードの場合
        return False


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

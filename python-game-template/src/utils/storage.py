"""
データ永続化システム

設定ファイルやログの保存場所を管理
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

from pydantic import BaseModel


def get_app_data_dir() -> Path:
    """アプリケーションデータディレクトリを取得

    Returns:
        アプリケーションデータディレクトリのパス
    """
    # OSに応じて適切なデータディレクトリを決定
    if os.name == "nt":  # Windows
        app_data = os.getenv("APPDATA", os.path.expanduser("~"))
        base_dir = Path(app_data) / "PythonGameTemplate"
    else:  # Unix系（Linux, macOS）
        # XDG Base Directory Specificationに従う
        xdg_data_home = os.getenv("XDG_DATA_HOME")
        if xdg_data_home:
            base_dir = Path(xdg_data_home) / "python-game-template"
        else:
            base_dir = Path.home() / ".local" / "share" / "python-game-template"

    # ディレクトリが存在しない場合は作成
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir


def get_config_dir() -> Path:
    """設定ディレクトリを取得

    Returns:
        設定ディレクトリのパス
    """
    config_dir = get_app_data_dir() / "config"
    config_dir.mkdir(exist_ok=True)
    return config_dir


def get_save_data_dir() -> Path:
    """セーブデータディレクトリを取得

    Returns:
        セーブデータディレクトリのパス
    """
    save_dir = get_app_data_dir() / "saves"
    save_dir.mkdir(exist_ok=True)
    return save_dir


class ConfigManager:
    """設定管理クラス"""

    def __init__(self, config_name: str = "game_config"):
        """初期化

        Args:
            config_name: 設定ファイル名（拡張子なし）
        """
        self.config_name = config_name
        self.config_file = get_config_dir() / f"{config_name}.json"

    def save_config(self, config: BaseModel) -> bool:
        """設定を保存

        Args:
            config: 保存する設定オブジェクト

        Returns:
            保存に成功したかどうか
        """
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config.model_dump(), f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Failed to save config: {e}")
            return False

    def load_config(self, config_class: type[BaseModel]) -> Optional[BaseModel]:
        """設定を読み込み

        Args:
            config_class: 設定クラス

        Returns:
            読み込んだ設定オブジェクト、失敗した場合はNone
        """
        try:
            if not self.config_file.exists():
                return None

            with open(self.config_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            return config_class(**data)
        except Exception as e:
            print(f"Failed to load config: {e}")
            return None

    def config_exists(self) -> bool:
        """設定ファイルが存在するかチェック

        Returns:
            設定ファイルが存在するかどうか
        """
        return self.config_file.exists()

    def delete_config(self) -> bool:
        """設定ファイルを削除

        Returns:
            削除に成功したかどうか
        """
        try:
            if self.config_file.exists():
                self.config_file.unlink()
            return True
        except Exception as e:
            print(f"Failed to delete config: {e}")
            return False


class SaveDataManager:
    """セーブデータ管理クラス"""

    def __init__(self, save_name: str = "game_save"):
        """初期化

        Args:
            save_name: セーブファイル名（拡張子なし）
        """
        self.save_name = save_name
        self.save_file = get_save_data_dir() / f"{save_name}.json"

    def save_data(self, data: BaseModel) -> bool:
        """データを保存

        Args:
            data: 保存するデータオブジェクト

        Returns:
            保存に成功したかどうか
        """
        try:
            with open(self.save_file, "w", encoding="utf-8") as f:
                json.dump(data.model_dump(), f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Failed to save data: {e}")
            return False

    def load_data(self, data_class: type[BaseModel]) -> Optional[BaseModel]:
        """データを読み込み

        Args:
            data_class: データクラス

        Returns:
            読み込んだデータオブジェクト、失敗した場合はNone
        """
        try:
            if not self.save_file.exists():
                return None

            with open(self.save_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            return data_class(**data)
        except Exception as e:
            print(f"Failed to load data: {e}")
            return None

    def save_exists(self) -> bool:
        """セーブファイルが存在するかチェック

        Returns:
            セーブファイルが存在するかどうか
        """
        return self.save_file.exists()

    def delete_save(self) -> bool:
        """セーブファイルを削除

        Returns:
            削除に成功したかどうか
        """
        try:
            if self.save_file.exists():
                self.save_file.unlink()
            return True
        except Exception as e:
            print(f"Failed to delete save: {e}")
            return False

    def list_saves(self) -> list[str]:
        """セーブファイル一覧を取得

        Returns:
            セーブファイル名のリスト（拡張子なし）
        """
        save_dir = get_save_data_dir()
        saves = []

        for save_file in save_dir.glob("*.json"):
            saves.append(save_file.stem)

        return sorted(saves)


def ensure_directories() -> None:
    """必要なディレクトリを作成"""
    get_app_data_dir()
    get_config_dir()
    get_save_data_dir()


def cleanup_temp_files() -> None:
    """一時ファイルをクリーンアップ"""
    app_dir = get_app_data_dir()

    # 一時ファイルパターン
    temp_patterns = ["*.tmp", "*.temp", "*~"]

    for pattern in temp_patterns:
        for temp_file in app_dir.rglob(pattern):
            try:
                temp_file.unlink()
            except OSError:
                pass  # 削除に失敗しても続行


def get_storage_info() -> Dict[str, Any]:
    """ストレージ情報を取得

    Returns:
        ストレージ情報の辞書
    """
    app_dir = get_app_data_dir()

    info = {
        "app_data_dir": str(app_dir),
        "config_dir": str(get_config_dir()),
        "save_data_dir": str(get_save_data_dir()),
        "total_size": 0,
        "file_count": 0,
    }

    # ディレクトリサイズを計算
    try:
        for file_path in app_dir.rglob("*"):
            if file_path.is_file():
                info["file_count"] += 1
                info["total_size"] += file_path.stat().st_size
    except OSError:
        pass

    return info

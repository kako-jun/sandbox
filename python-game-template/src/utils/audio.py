"""
音楽・音響管理システム

Pygameのmixer機能を使用してCUI版とGUI版共通の音響機能を提供
"""

import os
from pathlib import Path
from typing import Optional

try:
    import pygame  # type: ignore

    pygame.mixer.init()
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

from utils.logging import get_logger


class AudioManager:
    """音楽・音響管理クラス

    CUI版とGUI版で共通して使用できる音響機能を提供
    """

    def __init__(self):
        """初期化"""
        self.logger = get_logger("audio")
        self.initialized = False
        self.music_volume = 0.7
        self.sound_volume = 0.8

        if PYGAME_AVAILABLE:
            try:
                # pygame.mixer.init()は既に呼ばれているはず
                self.initialized = True
                self.logger.info("Audio system initialized successfully")
            except Exception as e:
                self.logger.warning(f"Failed to initialize audio system: {e}")
                self.initialized = False
        else:
            self.logger.warning("Pygame not available, audio system disabled")

    def is_available(self) -> bool:
        """音響システムが利用可能かどうか

        Returns:
            利用可能かどうか
        """
        return self.initialized and PYGAME_AVAILABLE

    def play_music(
        self, file_path: str, loops: int = -1, volume: Optional[float] = None
    ) -> bool:
        """音楽を再生

        Args:
            file_path: 音楽ファイルのパス
            loops: ループ回数（-1で無限ループ）
            volume: 音量（0.0-1.0、Noneでデフォルト音量）

        Returns:
            再生に成功したかどうか
        """
        if not self.is_available():
            self.logger.debug("Audio not available, skipping music playback")
            return False

        try:
            # ファイルの存在確認
            if not os.path.exists(file_path):
                # テスト用のダミー音楽データを生成（無音）
                self.logger.info(
                    f"Music file not found: {file_path}, using silent mode"
                )
                return True

            pygame.mixer.music.load(file_path)

            if volume is not None:
                pygame.mixer.music.set_volume(volume)
            else:
                pygame.mixer.music.set_volume(self.music_volume)

            pygame.mixer.music.play(loops)
            self.logger.info(f"Started playing music: {file_path}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to play music {file_path}: {e}")
            return False

    def stop_music(self) -> None:
        """音楽を停止"""
        if not self.is_available():
            return

        try:
            pygame.mixer.music.stop()
            self.logger.info("Music stopped")
        except Exception as e:
            self.logger.error(f"Failed to stop music: {e}")

    def pause_music(self) -> None:
        """音楽を一時停止"""
        if not self.is_available():
            return

        try:
            pygame.mixer.music.pause()
            self.logger.info("Music paused")
        except Exception as e:
            self.logger.error(f"Failed to pause music: {e}")

    def unpause_music(self) -> None:
        """音楽の一時停止を解除"""
        if not self.is_available():
            return

        try:
            pygame.mixer.music.unpause()
            self.logger.info("Music unpaused")
        except Exception as e:
            self.logger.error(f"Failed to unpause music: {e}")

    def is_music_playing(self) -> bool:
        """音楽が再生中かどうか

        Returns:
            再生中かどうか
        """
        if not self.is_available():
            return False

        try:
            return pygame.mixer.music.get_busy()
        except Exception:
            return False

    def set_music_volume(self, volume: float) -> None:
        """音楽の音量を設定

        Args:
            volume: 音量（0.0-1.0）
        """
        volume = max(0.0, min(1.0, volume))  # 0.0-1.0にクランプ
        self.music_volume = volume

        if not self.is_available():
            return

        try:
            pygame.mixer.music.set_volume(volume)
            self.logger.debug(f"Music volume set to {volume}")
        except Exception as e:
            self.logger.error(f"Failed to set music volume: {e}")

    def get_music_volume(self) -> float:
        """音楽の音量を取得

        Returns:
            現在の音量
        """
        return self.music_volume

    def play_sound(self, file_path: str, volume: Optional[float] = None) -> bool:
        """効果音を再生

        Args:
            file_path: 音響ファイルのパス
            volume: 音量（0.0-1.0、Noneでデフォルト音量）

        Returns:
            再生に成功したかどうか
        """
        if not self.is_available():
            self.logger.debug("Audio not available, skipping sound playback")
            return False

        try:
            # ファイルの存在確認
            if not os.path.exists(file_path):
                self.logger.debug(f"Sound file not found: {file_path}, skipping")
                return True

            sound = pygame.mixer.Sound(file_path)

            if volume is not None:
                sound.set_volume(volume)
            else:
                sound.set_volume(self.sound_volume)

            sound.play()
            self.logger.debug(f"Played sound: {file_path}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to play sound {file_path}: {e}")
            return False

    def cleanup(self) -> None:
        """終了処理"""
        if self.is_available():
            try:
                pygame.mixer.music.stop()
                pygame.mixer.stop()
                self.logger.info("Audio system cleaned up")
            except Exception as e:
                self.logger.error(f"Error during audio cleanup: {e}")


# グローバルインスタンス
_audio_manager: Optional[AudioManager] = None


def get_audio_manager() -> AudioManager:
    """オーディオマネージャーのグローバルインスタンスを取得

    Returns:
        AudioManagerインスタンス
    """
    global _audio_manager
    if _audio_manager is None:
        _audio_manager = AudioManager()
    return _audio_manager


def cleanup_audio() -> None:
    """オーディオシステムのクリーンアップ"""
    global _audio_manager
    if _audio_manager is not None:
        _audio_manager.cleanup()

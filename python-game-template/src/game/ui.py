import os
import sys
import time
import json
import logging
from typing import Optional, Dict, Any, List, Tuple, Union, Callable
from pathlib import Path
from ..utils.i18n import get_text
from ..utils.logging import setup_logger
from .core import Game
from .models import GameState, GameConfig, Player, Position, Direction, GameAction, Difficulty, GameMode

# ロガーの設定
logger = setup_logger(__name__)

# 国際化の設定
i18n = get_text

class GameUI:
    """ゲームのUIを管理するクラス"""
    
    def __init__(self, game: Game) -> None:
        """
        初期化
        
        Args:
            game (Game): ゲームインスタンス
        """
        self.game = game
        self.running = False
        self.last_tick_time = 0.0
        self.tick_interval = 0.1  # 100ms
        self.on_tick: Optional[Callable[[GameState], None]] = None
        self.on_game_over: Optional[Callable[[GameState], None]] = None
    
    def start(self) -> None:
        """ゲームを開始する"""
        self.running = True
        self.last_tick_time = time.time()
        
        while self.running:
            current_time = time.time()
            if current_time - self.last_tick_time >= self.tick_interval:
                self._tick()
                self.last_tick_time = current_time
            
            time.sleep(0.01)  # CPU使用率を下げる
    
    def stop(self) -> None:
        """ゲームを停止する"""
        self.running = False
    
    def _tick(self) -> None:
        """ゲームの1ティックを処理する"""
        state = self.game.tick()
        if not state:
            return
        
        if self.on_tick:
            self.on_tick(state)
        
        if state.game_over and self.on_game_over:
            self.on_game_over(state)
            self.stop()
    
    def process_input(self, action: GameAction) -> bool:
        """
        ユーザー入力を処理する
        
        Args:
            action (GameAction): ゲームアクション
            
        Returns:
            bool: 処理が成功したかどうか
        """
        return self.game.process_action(action)
    
    def get_state(self) -> Optional[GameState]:
        """
        現在のゲーム状態を取得する
        
        Returns:
            Optional[GameState]: ゲーム状態
        """
        return self.game.get_state()
    
    def reset(self) -> Optional[GameState]:
        """
        ゲームをリセットする
        
        Returns:
            Optional[GameState]: リセット後のゲーム状態
        """
        return self.game.reset()
    
    def configure(self, config: GameConfig) -> Optional[GameState]:
        """
        ゲームの設定を変更する
        
        Args:
            config (GameConfig): ゲーム設定
            
        Returns:
            Optional[GameState]: 更新後のゲーム状態
        """
        return self.game.configure(config) 
import os
import sys
import time
import json
import logging
import unittest
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from src.cli.main import main, parse_args
from src.game.models import GameState, GameConfig, Player, Position, Direction, GameAction, Difficulty, GameMode
from unittest.mock import patch, mock_open
import pytest
from io import StringIO

class TestCLI(unittest.TestCase):
    """CLIのテストクラス"""
    
    def setUp(self) -> None:
        """テストの前準備"""
        self.original_stdin = sys.stdin
        self.original_stdout = sys.stdout
        sys.stdin = open(os.devnull, 'r')
        sys.stdout = open(os.devnull, 'w')
        self.original_argv = sys.argv
    
    def tearDown(self) -> None:
        """テストの後処理"""
        sys.stdin.close()
        sys.stdout.close()
        sys.stdin = self.original_stdin
        sys.stdout = self.original_stdout
        sys.argv = self.original_argv
    
    @patch('src.cli.main.GameUI')
    def test_main(self, mock_ui):
        """main関数をテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--invalid-option"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    @patch('src.cli.main.GameUI')
    def test_game_initialization(self, mock_ui):
        """ゲームの初期化をテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--player-name", "test_player"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--player-name", ""]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    @patch('src.cli.main.GameUI')
    def test_game_configuration(self, mock_ui):
        """ゲームの設定をテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--difficulty", "hard", "--board-width", "30", "--board-height", "30"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--board-width", "0", "--board-height", "0"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    @patch('src.cli.main.GameUI')
    def test_game_mode(self, mock_ui):
        """ゲームモードをテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--mode", "time_attack", "--time-limit", "300"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--mode", "invalid_mode"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    def test_game_controls(self) -> None:
        """ゲームのコントロールをテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--help"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
    
    def test_game_save_load(self) -> None:
        """ゲームのセーブとロードをテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--save", "test_save.json"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        sys.argv = ["cli.py", "--load", "test_save.json"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--load", "invalid_save.json"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    def test_game_replay(self) -> None:
        """ゲームのリプレイをテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--replay", "test_replay.json"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--replay", "invalid_replay.json"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    def test_game_statistics(self) -> None:
        """ゲームの統計情報をテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--stats"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--stats", "--invalid-option"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)
    
    def test_game_help(self) -> None:
        """ヘルプメッセージをテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--help"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
    
    def test_game_version(self) -> None:
        """ゲームのバージョン情報をテストする"""
        # 正常系のテスト
        sys.argv = ["cli.py", "--version"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(0)
        
        # エラー系のテスト
        sys.argv = ["cli.py", "--version", "--invalid-option"]
        with patch('sys.exit') as mock_exit:
            main()
            mock_exit.assert_called_once_with(1)

def test_cli_help(capsys):
    """ヘルプ表示のテスト"""
    sys.argv = ["snake_game", "--help"]
    with pytest.raises(SystemExit):
        main()
    captured = capsys.readouterr()
    assert "usage:" in captured.out.lower()
    assert "options:" in captured.out.lower()

def test_cli_version(capsys):
    """バージョン表示のテスト"""
    sys.argv = ["snake_game", "--version"]
    with pytest.raises(SystemExit):
        main()
    captured = capsys.readouterr()
    assert "snake game" in captured.out.lower()
    assert "version" in captured.out.lower()

def test_cli_start_game(capsys):
    """ゲーム開始のテスト"""
    sys.argv = ["snake_game", "start"]
    main()
    captured = capsys.readouterr()
    assert "game started" in captured.out.lower()

def test_cli_start_game_with_config(capsys):
    """設定付きゲーム開始のテスト"""
    sys.argv = [
        "snake_game", "start",
        "--width", "30",
        "--height", "30",
        "--speed", "2",
        "--food-value", "20",
        "--time-limit", "600"
    ]
    main()
    captured = capsys.readouterr()
    assert "game started" in captured.out.lower()

def test_cli_invalid_command(capsys):
    """無効なコマンドのテスト"""
    sys.argv = ["snake_game", "invalid_command"]
    with pytest.raises(SystemExit):
        main()
    captured = capsys.readouterr()
    assert "error:" in captured.out.lower()

def test_cli_invalid_option(capsys):
    """無効なオプションのテスト"""
    sys.argv = ["snake_game", "--invalid-option"]
    with pytest.raises(SystemExit):
        main()
    captured = capsys.readouterr()
    assert "error:" in captured.out.lower()

def test_cli_start_game_with_invalid_config(capsys):
    """無効な設定でのゲーム開始のテスト"""
    sys.argv = [
        "snake_game", "start",
        "--width", "-1",
        "--height", "0",
        "--speed", "0",
        "--food-value", "-10",
        "--time-limit", "-1"
    ]
    with pytest.raises(SystemExit):
        main()
    captured = capsys.readouterr()
    assert "error:" in captured.out.lower()

if __name__ == '__main__':
    unittest.main()
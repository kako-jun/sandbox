"""
メイン機能のテスト
"""

import sys
from unittest.mock import Mock, patch

import pytest

import sys
from pathlib import Path

src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from main import load_config, main, parse_arguments
from game.models import GameConfig, GameMode, Language


class TestArgumentParsing:
    """コマンドライン引数解析のテスト"""

    def test_デフォルト引数(self):
        """デフォルト引数で解析される"""
        with patch.object(sys, "argv", ["main.py"]):
            args = parse_arguments()
            assert args.mode == "gui"
            assert args.language is None
            assert args.debug is False
            assert args.fullscreen is False

    def test_モード指定(self):
        """モードを指定できる"""
        with patch.object(sys, "argv", ["main.py", "--mode", "cui"]):
            args = parse_arguments()
            assert args.mode == "cui"

    def test_言語指定(self):
        """言語を指定できる"""
        with patch.object(sys, "argv", ["main.py", "--language", "ja"]):
            args = parse_arguments()
            assert args.language == "ja"

    def test_デバッグモード(self):
        """デバッグモードを指定できる"""
        with patch.object(sys, "argv", ["main.py", "--debug"]):
            args = parse_arguments()
            assert args.debug is True

    def test_フルスクリーン(self):
        """フルスクリーンを指定できる"""
        with patch.object(sys, "argv", ["main.py", "--fullscreen"]):
            args = parse_arguments()
            assert args.fullscreen is True

    def test_FPS指定(self):
        """FPSを指定できる"""
        with patch.object(sys, "argv", ["main.py", "--fps", "30"]):
            args = parse_arguments()
            assert args.fps == 30

    def test_ウィンドウサイズ指定(self):
        """ウィンドウサイズを指定できる"""
        with patch.object(
            sys, "argv", ["main.py", "--width", "1024", "--height", "768"]
        ):
            args = parse_arguments()
            assert args.width == 1024
            assert args.height == 768

    def test_ログレベル指定(self):
        """ログレベルを指定できる"""
        with patch.object(sys, "argv", ["main.py", "--log-level", "DEBUG"]):
            args = parse_arguments()
            assert args.log_level == "DEBUG"

    def test_ログ出力制御(self):
        """ログ出力を制御できる"""
        with patch.object(
            sys, "argv", ["main.py", "--no-console-log", "--no-file-log"]
        ):
            args = parse_arguments()
            assert args.no_console_log is True
            assert args.no_file_log is True


class TestConfigLoading:
    """設定読み込みのテスト"""

    def test_デフォルト設定読み込み(self):
        """デフォルト設定が読み込まれる"""
        # モックの引数オブジェクト
        args = Mock()
        args.mode = None
        args.language = None
        args.debug = False
        args.fullscreen = False
        args.fps = None
        args.width = None
        args.height = None

        with patch("main.ConfigManager") as mock_config_manager:
            mock_manager = Mock()
            mock_manager.load_config.return_value = None  # 設定ファイルなし
            mock_config_manager.return_value = mock_manager

            config = load_config(args)

            assert isinstance(config, GameConfig)
            assert config.mode == GameMode.GUI
            assert config.language == Language.ENGLISH

    def test_コマンドライン引数による上書き(self):
        """コマンドライン引数で設定が上書きされる"""
        args = Mock()
        args.mode = "cui"
        args.language = "ja"
        args.debug = True
        args.fullscreen = True
        args.fps = 30
        args.width = 1024
        args.height = 768

        with patch("main.ConfigManager") as mock_config_manager:
            mock_manager = Mock()
            mock_manager.load_config.return_value = None
            mock_config_manager.return_value = mock_manager

            config = load_config(args)

            assert config.mode == GameMode.CUI
            assert config.language == Language.JAPANESE
            assert config.debug is True
            assert config.fullscreen is True
            assert config.fps == 30
            assert config.window_size.width == 1024
            assert config.window_size.height == 768

    def test_保存済み設定読み込み(self):
        """保存済みの設定が読み込まれる"""
        args = Mock()
        args.mode = None
        args.language = None
        args.debug = False
        args.fullscreen = False
        args.fps = None
        args.width = None
        args.height = None

        # 保存済み設定をモック
        saved_config = GameConfig(mode=GameMode.CUI, language=Language.JAPANESE, fps=45)

        with patch("main.ConfigManager") as mock_config_manager:
            mock_manager = Mock()
            mock_manager.load_config.return_value = saved_config
            mock_config_manager.return_value = mock_manager

            config = load_config(args)

            # 保存済み設定が使用される
            assert config.mode == GameMode.CUI
            assert config.language == Language.JAPANESE
            assert config.fps == 45

    def test_FPS範囲制限(self):
        """FPS の範囲が制限される"""
        args = Mock()
        args.mode = None
        args.language = None
        args.debug = False
        args.fullscreen = False
        args.fps = 150  # 上限を超える値
        args.width = None
        args.height = None

        with patch("main.ConfigManager") as mock_config_manager:
            mock_manager = Mock()
            mock_manager.load_config.return_value = None
            mock_config_manager.return_value = mock_manager

            config = load_config(args)

            # 上限に制限される
            assert config.fps == 120

    def test_ウィンドウサイズ最小値制限(self):
        """ウィンドウサイズの最小値が制限される"""
        args = Mock()
        args.mode = None
        args.language = None
        args.debug = False
        args.fullscreen = False
        args.fps = None
        args.width = 100  # 最小値未満
        args.height = 200  # 最小値未満

        with patch("main.ConfigManager") as mock_config_manager:
            mock_manager = Mock()
            mock_manager.load_config.return_value = None
            mock_config_manager.return_value = mock_manager

            config = load_config(args)

            # 最小値に制限される
            assert config.window_size.width == 400
            assert config.window_size.height == 300


class TestMainFunction:
    """メイン関数のテスト"""

    @patch("main.run_game")
    @patch("main.save_config")
    @patch("main.initialize_systems")
    @patch("main.load_config")
    @patch("main.parse_arguments")
    def test_正常実行(self, mock_parse, mock_load, mock_init, mock_save, mock_run):
        """正常実行の流れ"""
        # モックの設定
        mock_args = Mock()
        mock_config = GameConfig()

        mock_parse.return_value = mock_args
        mock_load.return_value = mock_config
        mock_run.return_value = 0

        # メイン関数実行
        result = main()

        # 各関数が呼ばれることを確認
        mock_parse.assert_called_once()
        mock_load.assert_called_once_with(mock_args)
        mock_init.assert_called_once_with(mock_config, mock_args)
        mock_run.assert_called_once_with(mock_config)
        mock_save.assert_called_once_with(mock_config)

        assert result == 0

    @patch("main.run_game")
    @patch("main.save_config")
    @patch("main.initialize_systems")
    @patch("main.load_config")
    @patch("main.parse_arguments")
    def test_ゲーム実行エラー(self, mock_parse, mock_load, mock_init, mock_save, mock_run):
        """ゲーム実行でエラーが発生した場合"""
        # モックの設定
        mock_args = Mock()
        mock_config = GameConfig()

        mock_parse.return_value = mock_args
        mock_load.return_value = mock_config
        mock_run.return_value = 1  # エラー終了コード

        # メイン関数実行
        result = main()

        # エラー終了コードが返される
        assert result == 1

        # 設定保存は実行される
        mock_save.assert_called_once_with(mock_config)

    @patch("main.parse_arguments")
    def test_初期化エラー(self, mock_parse):
        """初期化でエラーが発生した場合"""
        # parse_arguments でエラーを発生させる
        mock_parse.side_effect = Exception("初期化エラー")

        # メイン関数実行
        result = main()

        # エラー終了コード
        assert result == 1

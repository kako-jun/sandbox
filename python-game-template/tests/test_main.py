"""
main.py モジュールのテスト
"""

import sys
from pathlib import Path
from unittest.mock import Mock, patch

import pytest

# srcディレクトリをパスに追加
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from game.models import GameConfig, GameMode, Language, Size
from main import load_config, main, parse_arguments


class TestArgumentParsing:
    """引数解析のテスト"""

    def test_デフォルト引数(self):
        """デフォルト引数で解析される"""
        with patch.object(sys, "argv", ["main.py"]):
            args = parse_arguments()
            assert args.cui_only is False
            assert args.gui_only is False
            assert args.both is False

    def test_CUIモード指定(self):
        """CUIモードを指定できる"""
        with patch.object(sys, "argv", ["main.py", "--cui-only"]):
            args = parse_arguments()
            assert args.cui_only is True


class TestConfigLoading:
    """設定読み込みのテスト"""

    def test_デフォルト設定読み込み(self):
        """デフォルト設定が読み込まれる"""
        # モックの引数オブジェクト
        args = Mock()
        args.cui_only = False
        args.gui_only = False
        args.both = False
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

    def test_コマンドライン引数による上書き(self):
        """コマンドライン引数で設定が上書きされる"""
        args = Mock()
        args.cui_only = True
        args.gui_only = False
        args.both = False
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
            assert config.language == Language.JA


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

        # プロセスロック関連をモック化
        with patch("main.check_single_instance", return_value=True):
            with patch("main.get_process_locks", return_value=[]):
                # メイン関数実行
                result = main()

                # 各関数が呼ばれることを確認
                mock_parse.assert_called_once()
                assert result == 0

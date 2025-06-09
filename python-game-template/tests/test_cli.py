import unittest
from src.cli.main import main  # CLIのエントリーポイントをインポート

class TestCLI(unittest.TestCase):
    def test_main(self):
        # コマンドライン引数を模擬してmain関数をテスト
        result = main(['--help'])  # ヘルプオプションをテスト
        self.assertEqual(result, 0)  # 正常終了を確認

    def test_invalid_command(self):
        # 無効なコマンドをテスト
        with self.assertRaises(SystemExit) as cm:
            main(['invalid_command'])
        self.assertEqual(cm.exception.code, 1)  # エラー終了を確認

    # 他のCLI機能のテストを追加することができます

if __name__ == '__main__':
    unittest.main()
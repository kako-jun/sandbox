# Application messages
app-name = Rust ツールテンプレート
app-description = Rustで構築されたCLIツールテンプレート

# Commands
command-add = 新しいデータエントリを追加
command-list = すべてのデータエントリを一覧表示
command-process = すべてのデータを処理
command-stats = 統計情報を表示

# Messages
no-command-specified = コマンドが指定されていません。使用方法については --help を参照してください。
no-data-found = データエントリが見つかりません。
data-entries = データエントリ:
statistics = 統計情報:
added-entry = ID { $id } でエントリを追加しました
unknown-command = 不明なコマンド: { $command }
error-processing = データ処理エラー: { $error }
name-required = addコマンドには名前が必要です
value-required = addコマンドには値が必要です

# Usage help
usage-title = 使用例:
usage-add = データ追加:  { $program } -m cli -c add -n "item1" -v 100
usage-list = データ一覧: { $program } -m cli -c list
usage-process = 処理実行:   { $program } -m cli -c process
usage-stats = 統計表示:   { $program } -m cli -c stats
usage-tui = TUIモード:   { $program } -m tui
usage-interactive-add = インタラクティブ: { $program } -m cli -c interactive-add [-n 名前] [-v 値]
usage-batch-add = バッチ追加:   { $program } -m cli -c batch-add [-n ベース名] [-v ベース値]

# Interactive commands
interactive-add-title = インタラクティブ追加モード
batch-add-title = バッチ追加モード
interactive-added-entry = インタラクティブエントリが追加されました - ID: { $id }, 名前: { $name }, 値: { $value }
batch-add-completed = バッチ追加が完了しました

# Error messages
application-error = アプリケーションエラー: { $error }
startup-message = rust-tool-templateアプリケーションを開始しています
finished-message = アプリケーションが正常に終了しました

# Logging
log-rotation-info = ログローテーションが完了しました
log-file-created = ログファイルが作成されました: { $path }

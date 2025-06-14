# Nostalgic BBS プロジェクト情報

## プロジェクト概要
昔、インターネットにはBBSという文化があった。
ホームページを訪れた人に対してブログのコメント欄のようなもの用意する仕組みである。
それを最新の技術で実現して、自分のサイトに埋め込むほか、APIを公開して使ってもらいたい。
名前をNostalgic BBSとする。

## 設計要件
- ユーザー登録、ログイン、認証の仕組みは不要
- 個人情報保護法に配慮する必要のないシンプルな仕組み
- Nextで作成、永続化はVercelの仕組みを使用
- すべて無料で可能な設計が条件

## 機能要件
- 画像の添付は不要
- 荒らし対策は必要
- 足跡帳機能：「あなたの国は？」などを絵文字で選択可能
- 書き込みの削除、掲示板の削除は管理者（私）のみが可能
- 管理画面は作らず、管理者用の秘密のAPIで操作

## 技術的設計
- 永続化：書き込み配列をURLごとに保持
- DB：細かい検索不要のため、KeyValue型のDBが適切
- 実装方式：scriptタグでAPIを呼ぶ形
- レンダリング：APIがサーバーレンダリングしたHTMLを返す
- スタイル：ユーザー側でclass指定による微調整を想定

## 使用方法
- ユーザーが「このURLでBBSを設置します」という行動を取る
- scriptタグでAPIを呼び出す
- 追加のタグは不要
- 表示位置はユーザーが指定
# project Mabo

## requirement

1. DiscordとMaboを使用し、TRPG:CoCのオンラインセッションを過不足なく行うことができる。
1. Chrome (Not IE)

## develop environment
1. ~~LAMP~~ さよなLAMP

1. dockerhub - node:latest
```
$ cat /etc/issue
Debian GNU/Linux 8 \n \l
```
1. node.js `v7.4.0`
	2. npm `v4.0.5`

#### frameworks
##### php
1. ~~Laravel~~ 大げさ
1. ~~fuelphp~~ API作るだけならnodejsでもできる
##### js
2. ~~Angular2~~ 学習コスト高いらしい
	3. ~~TypeScript~~
1. express
	2. pug ( jade )
##### view
5. [vue](https://jp.vuejs.org/) プレイ画面でスポットで使うかも
4. ~~[knockout]~~(http://knockoutjs.com/) 
##### API
1. [express](http://expressjs.com/)
##### DB
1. MySQL
1. MongoDB
##### push
1. websocket-server
2. socket.io-emitter

	[HTML5Rocks](https://www.html5rocks.com/ja/tutorials/websockets/basics/)にPush通知についての記事があった
##### other
1. gulp
2. webpack
3. browserfy
##### Styling
1. Sass
1. Bootstrap4 alpha-v6

## phase

### chat
1. push
	2. socket.io - crash course
1. express
	2. pug
1. bootstrap4

### mock
1. login
2. scenarios
3. playground
4. bug report

### minimum implement
1. chat
2. roll
3. bug report

### staging

### full

## functions

1. ルーム
    1. ログイン機能
    1. ルーム(シナリオ)名
    1. ~~ゲームシステム~~ → CoC限定
    1. パスワード
    1. ロール
        1. KP - Game Keeper
        1. PL - Player
        1. (VI - Visitor)
1. チャット
    1. チャットチャンネル
        1. 切替
        1. 追加
        1. 設定
    1. キャラクタ
        1. 文字色
        1. 立ち絵
    1. テキストコマンド
        1. エモート
        1. ロール
1. 画面の共有
    1. テーブル - table
    1. マップ - map
    1. マップマスク - map mask
    1. スチル - still
    1. キャラクタ - character
    1. カード - card
1. 情報の共有
    1. 共有メモ
        1. (Markdown)
    1. ステータスインジケータ
        1. 通信状況
        1. 同期状況
            1. チャット入力中表示
            1. 画面同期中表示
    1. システムログ
        1. ダイス結果
        1. ステータスDIFF
    1. キャラクタ
        1. キャラクタシート
        1. クイックビュー
            1. テーブル上のキャラクタ一覧を表示。
            1. DEX
            1. 名前
            1. HP
            1. MP
            1. SAN
    1. サウンド
        1. ~~BGM~~ → サポートしない
        1. 効果音
    1. ~~手書きメモ~~ → サポートしない
1. ツール
    1. ロール
        1. 通常ロール
        1. システムロール
            1. SANチェックロール
            1. ダメージロール
            1. 判定ロール
            1. カスタムロール
    1. ダイス作成
    1. ロールリクエスト
        1. ロールするダイス
        1. 理由
    1. ファイル管理
        1. アップローダ
            1. 画像
            1. サウンドファイル
        1. タグ
        1. パスワード
"use strict";

/*
 * 共通関数など
 */
const CU = require('./commonUtil.js');

const trace = require('./_trace.js');

const imageManager  = require('./_imageManager.js');
const PlayGround = require('./_playGround.js');
const CharacterGrid = require('./_characterGrid.js');
const TextForm = require('./_TextForm.js');
const Log = require('./_Log');
const ChatLog = require('./_ChatLog.js');
const fukidashi = require('./_fukidashi.js');

let textForms = [];
let chatLogs = [];

let hot;

/*
 * socket.io
 */
const SOCKET_EP = process.env.SOCKET_EP;
const socket    = io(SOCKET_EP);

const scenarioId   = CU.getScenarioId();
const scenarioName = CU.getScenarioName();

socket.on('connect', function() {
    /*
     * 接続確立後、シナリオIDごとのsocket.roomへjoinするようサーバへ要請する
     */
    trace.info('接続しました！');
    socket.emit('join', scenarioId);
});

socket.on('welcome', () => {
    /*
     * socket.roomへ正常にjoinした際のウェルカムアクション
     */
    trace.info(`シナリオID:${scenarioId}のsocket.roomへjoinしました！`);
});

socket.on('logOut', function(container) {
    /*
     * 他ユーザのログアウト通知を受信した際の処理
     */
    fukidashi.clear();
});
socket.on('onType', function(container) {
    fukidashi.add(container);
});

$(window)
    .ready(() => {
    
        /*
         * パラメータ追加モーダル
         */
        $('#modalAddParam').modal({
            startingTop: '4%',
            endingTop  : '10%',
        });
        
        /*
         * ブラウザバックの向き先をこのページにする(厳密なブラウザバックの禁止ではない)
         */
        history.pushState(null, null, null);
        window.addEventListener("popstate", function() {
            history.pushState(null, null, null);
        });

        $('.brand-logo').text(scenarioName);
    
        /*
         * デフォルトで表示するGUI
         */
    
        /*
         * チャット入力フォーム
         */
        textForms.push(new TextForm(socket));
    
        /*
         * ボード
         */
        const playGround = new PlayGround(socket);
    
        
        fukidashi.setSocket(socket);
        
        /*
         * キャララクタ表(リソース表)
         */
        const characterGrid = new CharacterGrid(socket, playGround);
    
        /*
         * チャットログ
         *
         * チャットログの初期化
         * Logインスタンスを参照してチャット履歴を表示
         */
        const log = new Log(socket);
        log.loadFromDB()
            .then(() => {
                chatLogs.push(new ChatLog(socket, log));
            })
            .catch((error) => {
                console.error(error); // @DELETEME
            })
    })
    .focus(() => {
        /*
         * ウィンドウがアクティブに戻ったら、チャット入力欄をフォーカスする
         */
        textForms[0].focus();
    });




// $('#imageUploader').dialog({
//     autoOpen : true,
//     resizable: true,
//     position : {at: 'left center'},
//     title    : '画像登録',
//     classes  : {
//         "ui-dialog": "imageUploader"
//     },
//     buttons  : [],
//     width    : 600,
//     height   : 400,
//     dragStop : function(e, ui) {
//         keepInWindow(ui, '#imageUploader');
//     },
//     create   : function() {
//         /*
//          * input要素を秘匿しておき、triggerで発火させる
//          */
//         $('button[name=imagePicker]').on('click', function(e) {
//             $('input[name=image]').trigger('click');
//         });
//         /*
//          * ファイルを選択した時の処理
//          */
//         $('input[name=image]').change(function() {
//             imageManager.onImagePick(this.files);
//         });
//         /*
//          * アップロードボタン、クリックイベントと秘匿
//          */
//         $('button[name=imageUpload]').click(function() {
//             imageManager.upload()
//         });
//     },
//     open     : function() {
//         /*
//          * 共通タグを取得
//          */
//         imageManager.initCommonTag();
//
//     },
//     close    : function() {
//         /*
//          * 画像登録ウィンドウを閉じたら初期化する
//          */
//         imageManager.initImages()
//     }
// });

// $('#imageManager').dialog({
//     autoOpen : true,
//     resizable: true,
//     position : {at: 'right center'},
//     title    : '画像管理',
//     classes  : {
//         "ui-dialog": "imageManager"
//     },
//     buttons  : [],
//     width    : 600,
//     height   : 400,
//     dragStop : function(e, ui) {
//         keepInWindow(ui, '#imageManager');
//     },
//     create   : function() {
//     },
//     open     : function() {
//     },
//     close    : function() {
//     }
// });
// $('.ui-dialog-titlebar-close').each((i, v) => {
//     // $(v).css('display', 'none');
// });
//
// $('[role=dialog]').each((i, v) => {
//     $(v).css('position', 'fixed');
// });
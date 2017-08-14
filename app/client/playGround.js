"use strict";

/*
 * 共通関数など
 */
const CU = require('./commonUtil.js');

const trace = require('./_trace.js');

/*
 * 画像アップローダ
 */
const imageManager  = require('./_imageManager.js');

/*
 * ボードとコマ
 */
const PlayGround = require('./_playGround.js');

/*
 * キャラクタ表
 */
const CharacterGrid = require('./_characterGrid.js');

/*
 * チャット入力
 */
const TextForm = require('./_TextForm.js');

/*
 * チャット履歴
 */
const ChatLog = require('./_ChatLog.js');

let chatLogs = [];

/*
 * 入力中通知
 */
const fukidashi = require('./_fukidashi.js');

/*
 * socket managerを作成して使用するモジュールへ渡す
 */
const SOCKET_EP = process.env.SOCKET_EP;
const socket    = io(SOCKET_EP);

const textForm      = new TextForm(socket);
const playGround    = new PlayGround(socket);
const characterGrid = new CharacterGrid(socket, playGround);

fukidashi.setSocket(socket);

let hot;

const scenarioId   = CU.getScenarioId();
const scenarioName = CU.getScenarioName();

socket.on('connect', function() {
    /*
     * 接続確立後、シナリオIDごとのsocket.roomへjoinするようサーバへ要請する
     */
    trace.info('接続しました！');
    socket.emit('join', scenarioId);
});
socket.on('welcome', function() {
    /*
     * socket.roomへ正常にjoinした際のウェルカムアクション
     */
    trace.info(`シナリオID:${scenarioId}のsocket.roomへjoinしました！`);
    let msg = 'チャットへ接続しました！';
    chatLogs.forEach(function(c) {
        c.addLines(msg);
    });
    
});
socket.on('logIn', function(container) {
    /*
     * ログイン通知
     */
    if (socket.id === container.socketId) {
        // 自分の場合はエイリアスをsocket.idで初期化して終了
        $('#u').val(socket.id);
        return false;
    }
    
    let msg = `${container.socketId} がログインしました。`;
    chatLogs.forEach(function(c) {
        c.addLines(msg);
    });
});

socket.on('chatMessage', function(container) {
    /*
     * チャットを受信した際の処理
     */
    chatLogs.forEach(function(c) {
        c.addLines(container);
    });
    ChatLog._insert(container);
});

socket.on('changeAlias', function(container) {
    /*
     * エイリアスを変更した通知を受信した際の処理
     */
    chatLogs.forEach(function(c) {
        c.addLines(container);
    });
    ChatLog._insert(container);
});
socket.on('logOut', function(container) {
    /*
     * 他ユーザのログアウト通知を受信した際の処理
     */
    fukidashi.clear();
    chatLogs.forEach(function(c) {
        c.addLines(container);
    });
});
socket.on('onType', function(container) {
    fukidashi.add(container);
});

/**
 * キャラクタ表の更新リクエストを受信した際の処理
 */
socket.on('reloadCharacters', function(data) {
    /*
     * 自分が発信したものについては無視
     */
    if (data.from === socket.id) {
        return false;
    }
    characterGrid.reloadHot();
});

/**
 * 新規ボードをDBへ登録した後、他のユーザにそのボードを読み込み、DOMを作成させるリクエストを受信した際の処理
 */
socket.on('deployBoards', function(data) {
    let criteria = {};
    playGround.loadBoard(scenarioId);
});

/**
 * ボードをDBから削除した際、他のユーザにそのボードをDOMから削除させるリクエストを受信した際の処理
 */
socket.on('destroyBoards', function(data) {
    playGround.destroyBoard(data.boardId);
});

/**
 * 新規コマをDBへ登録した後、他のユーザにそのコマを読み込み、DOMを作成させるリクエストを受信した際の処理
 */
socket.on('deployPawns', function(data) {
    /*
     * キャラクタのコマをDBへ登録した後にコールする。
     * DBから指定した条件でコマをロードし、DOMとして配置する。
     */
    let boardId = data.boardId;
    playGround.getBoardById(boardId).loadPawn(data);
});

/**
 * コマの移動、名前、画像情報の変更の通知があった際、それらを反映する
 */
socket.on('movePawns', function(data) {
    let boardId     = data.boardId;
    let characterId = data.characterId;
    let dogTag      = data.dogTag;
    let meta        = {style: data.axis};
    
    let board     = playGround.getBoardById(boardId);
    let character = board.getCharacterById(characterId, dogTag);
    character.setMeta(meta);
});

/**
 * コマをDBから削除した際、他のユーザにそのコマをDOMから削除させるリクエストを受信した際の処理
 */
socket.on('destroyPawns', function(data) {
    let boardId = data.boardId;
    playGround.getBoardById(boardId).destroyCharacter(data.characterId, data.dogTag);
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

        /*
         * split-pane
         */
        $('div.split-pane').splitPane();
    
        $('.brand-logo').text(scenarioName);
        
        /*
         * チャットログの初期化
         * IndexedDBにMongoDBからレコードを挿入
         */
        ChatLog._reload(function() {
            let chatLog_0 = new ChatLog($('#mainChannel').find('.log'), socket, 0);
            let chatLog_1 = new ChatLog($('#subChannel').find('.log'), socket, 1);
            chatLogs.push(chatLog_0);
            chatLogs.push(chatLog_1);
        });
    
        let aliasDom      = $('span.alias');
        let aliasEdit = $('.alias-edit');
        let aliasInputDom = $('input.alias');
        $(aliasDom).on('click', (e) => {
            /*
             * エイリアスを非表示、テキストフォームを重ねて表示し全選択
             */
            let aliasName = $(aliasDom).text();
            $(aliasDom).addClass('d-none');
            $(aliasInputDom).val(aliasName).removeClass('d-none');
            aliasInputDom.focus().select();
        });
    
        /*
         * フォームからフォーカスが外れたら、その値でエイリアスを更新
         */
        $(aliasInputDom)
            .on('blur', (e) => {
                textForm.changeAlias();
                $(aliasDom).removeClass('d-none');
                $(aliasInputDom).addClass('d-none');
            })
            .on('keypress', (e) => {
                if (e.keyCode === 13 || e.key === 'Enter') {
                    textForm.changeAlias();
                    $(aliasDom).removeClass('d-none');
                    $(aliasInputDom).addClass('d-none');
                }
            });
    
        $('#consoleText')
            /*
             * changeとkeyupでフキダシを更新
             */
            .on('change', () => {
                textForm.onType();
            })
            .on('keyup', () => {
                textForm.onType();
            })
            /*
             *
             */
            .on('keypress', (e) => {
                if (e.keyCode === 13 || e.key === 'Enter') {
                    textForm.ret();
                    return false;
                }
                textForm.onType();
            })
            .on('blur', () => {
                textForm.onType();
            });
    
        $('.ui-autocomplete').css('z-index', '200');
    
        characterGrid.makeHot();
        characterGrid.reloadHot();
    
        playGround.loadBoard(scenarioId);
       
    })
    .focus(() => {
        /*
         * ウィンドウがアクティブに戻ったら、チャット入力欄をフォーカスする
         */
        $('#consoleText').focus();
        textForm.onType();
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
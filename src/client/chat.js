"use strict";

/*
 * 各モジュール読み込み
 */

/*
 * dotEnv
 */
const SOCKET_EP = process.env.SOCKET_EP;

/*
 * 共通関数など
 */
const util = require('./_util.js');

const trace = require('./_trace.js');

/*
 * 画像アップローダ
 */
const imageManager  = require('./_imageManager.js');

/*
 * ボードとコマ
 */
const playGround    = require('./_playGround.js');

/*
 * キャラクタ表
 */
const characterGrid = require('./_characterGrid.js');

/*
 * チャット
 */
const textForm = require('./_textForm.js');

/*
 * 入力中通知
 */
const fukidashi = require('./_fukidashi.js');

/*
 * 使うsocketを統一するため、socket managerを作成してモジュールへ渡す
 */
const socket    = io(SOCKET_EP);

playGround.setSocket(socket);
characterGrid.setSocket(socket);
textForm.setSocket(socket);
fukidashi.setSocket(socket);

let hot;

const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];

socket.on('connect', function() {
    /*
     * 接続確立後、シナリオIDごとのsocket.roomへjoinするようサーバへ要請する
     */
    trace.info('接続しました！');
    socket.emit('join', scenarioId);
});
socket.on('welcome', function() {
    /*
     * socket.roomへ正常にjoinした際のウェルカムメッセージ
     */
    trace.info(`シナリオID:${scenarioId}のsocket.roomへjoinしました！`);
    textForm.insertMessages({msg: 'チャットへ接続しました！'})
});
socket.on('logIn', function(container) {
    // ログイン通知
    if (socket.id === container.socketId) {
        // 自分の場合
        $('#u').val('Anonymous');
        textForm.insertMessages({msg: `ログインしました。 id = ${socket.id}`});
        return false;
    }
    textForm.insertMessages({msg: `${container.socketId} がログインしました。`});
});

socket.on('chatMessage', function(container) {
    textForm.insertMessages(container.data)
});

socket.on('changeAlias', function(data) {
    textForm.insertMessages(data)
});
socket.on('logOut', function(data) {
    fukidashi.clear();
    textForm.insertMessages(data)
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


// function Spell(name, pattern, logic) {
//     this.setName(name);
//     this.setPattern(pattern);
//     this.setLogic(logic);
//     this.publish();
// };
// Spell.prototype = {
//
//     setName(_name){
//         this.name = _name;
//     },
//     getName() {
//         return this.name;
//     },
//     setPattern(_pattern) {
//         this.pattern = _pattern;
//     },
//     getPattern(){
//         return this.pattern;
//     },
//     setLogic(_logic){
//         this.logic = _logic;
//     },
//     getLogic(){
//         return this.logic;
//     },
//     re(subject){
//         let regexp = new RegExp(this.getPattern());
//         return regexp.test(subject);
//     },
//     publish(){
//         spellBook.spell.push(this);
//     },
//     cast(spellName, arg, options, rawSpell){
//         this.logic(spellName, arg, options, rawSpell);
//     },
//     // ダイスクラス
//     makeDice(faces){
//         return new Dice(faces);
//     },
//     // spell内でのユーティリティメソッド
//     disp(){
//     },
//     // tellに近い……？
//     send(){
//     },
//     // Diceクラスのメソッドとして実装する？
//     xDy(){
//     },
//     ccb(){
//     },
//     // evalのラッパー。
//     _eval(){
//     },
// };
//
// function Dice(faces) {
//     this.faces = faces;
// }
// Dice.prototype = {};
//
// /*
//  * 数式処理を行うかの判定:
//  * 1. 数字、四則演算+余算、半角括弧、等号(==)、否定等号(!=)、不等号(<,>,<=,>=)、ccb、d (ignore case)
//  *  /^([\d-\+\*\/\%\(\)]|ccb|\d+d\d+)*$/i  @WIP
//  * 方針:
//  * 1. 予約演算子を置換する(有限回数ループ)
//  *   1. xDy、ccb
//  * 1. 正規表現でバリデートして_evalに突っ込む
//  * 1. 表示する
//  *   1. 処理する文字列(予約演算子置換前)
//  *   1. 計算する数式  (予約演算子置換後)
//  *   1. 結果
//  */
// let formula = new Spell('formula', /^aaa$/i, () => {
//     console.info(this); // @DELETEME
//
// });

$(window)
    .ready(() => {
        
        /*
         * ブラウザバックの向き先をこのページにする(厳密なブラウザバックの禁止ではない)
         */
        history.pushState(null, null, null);
        window.addEventListener("popstate", function() {
            history.pushState(null, null, null);
        });
        
        // データコンテナの初期化
        textForm.container.update();
        
        // typing……の判別用に、チャットバーにフォーカスが当たったタイミングの入力内容を保持する
        $('#m')
            .on('change', () => {
                textForm.onType();
            })
            .on('keypress', (e) => {
                if (e.keyCode === 13 || e.key === 'Enter') {
                    textForm.ret();
                    return false;
                }
                textForm.onType();
            })
            .on('keyup', () => {
                textForm.onType();
            })
            .on('blur', () => {
                textForm.onType();
            })
            .autocomplete({
                /**
                 * コマンド実行履歴も追加する？
                 */
                source  : ['/ccb', '/1D100', '/1D20'],
                position: {at: 'left bottom'},
                
            });
        $('.ui-autocomplete').css('z-index', '200');
        
        $('#u')
            .on('blur', () => {
                textForm.changeAlias();
            })
            .on('keypress', (e) => {
                if (e.keyCode === 13 || e.key === 'Enter') {
                    $('#m').focus();
                }
            });
        
        $('#addBoard').on('click', function() {
            playGround.deployBoard()
        });
        
        characterGrid.makeHot();
        characterGrid.reloadHot();
        
        playGround.loadBoard(scenarioId);
        
        function switcher(key) {
            switch (key) {
                case 'on':
                    $('#u')
                        .autocomplete({
                            source  : characterGrid.data.map(function(v) {
                                return v.NAME || '';
                            }).filter(function(v) {
                                return v !== '';
                            }),
                            position: {at: 'left bottom'},
                        });
                    $('#m')
                        .autocomplete({
                            source  : ['/ccb', '/1D100', '/1D20'],
                            position: {at: 'left bottom'},
                        });
                    break;
                case 'off':
                    $('#u')
                        .autocomplete('destroy');
                    $('#m')
                        .autocomplete('destroy');
                    break;
            }
        }
        
        function killSpace(selector) {
            $(selector)
                .css('margin', '0px')
                .css('padding', '0px')
                .css('width', '100%')
                .css('height');
        }
        
        function fitMessage() {
            killSpace('#chatLog');
            $('#messages-scroll').css('height', $('#chatLog').parent().height() - 45);
        }
        
        function keepInWindow(ui, selector) {
            if (ui.position.top < 30) {
                $(selector).parent().css('top', '30px');
            } else if (ui.position.bottom < 50) {
                $(selector).parent().css('bottom', '50px');
            } else if (ui.position.left < 0) {
                $(selector).parent().css('left', '0px');
            } else if (ui.position.right < 0) {
                $(selector).parent().css('right', '0px');
            }
        }
        
        $('#chatLog').dialog({
            autoOpen     : true,
            resizable    : true,
            position     : {at: "right bottom"},
            title        : '履歴',
            classes      : {
                "ui-dialog": "log"
            },
            buttons      : [],
            closeOnEscape: false,
            create       : function() {
                fitMessage();
                setTimeout(fitMessage, 1000)
            },
            resizeStop   : function() {
                fitMessage();
            },
            dragStop     : function(e, ui) {
                fitMessage();
                keepInWindow(ui, '#chatLog');
            }
        });
        
        $('#consoleBase').dialog({
            autoOpen     : true,
            resizable    : true,
            position     : {at: "left bottom"},
            minWidth     : 350,
            minHeight    : 180,
            title        : 'コンソール',
            classes      : {
                "ui-dialog": "console"
            },
            buttons      : [],
            closeOnEscape: false,
            create       : function() {
                killSpace('#consoleBase');
                switcher('on');
            },
            resizeStart  : () => {
                switcher('off');
            },
            resizeStop   : () => {
                killSpace('#consoleBase');
                switcher('on');
            },
            dragStart    : () => {
                switcher('off');
            },
            dragStop     : (e, ui) => {
                keepInWindow(ui, '#consoleBase');
                switcher('on');
            },
        });
        
        $('#characters').dialog({
            autoOpen     : true,
            resizable    : true,
            position     : {at: "right"},
            title        : 'キャラクタ',
            classes      : {
                "ui-dialog": "character"
            },
            buttons      : [],
            closeOnEscape: false,
            minHeight    : 100,
            minWidth     : 400,
            create       : () => {
                killSpace('#characters');
                characterGrid.renderHot();
            },
            resizeStop   : () => {
                killSpace('#characters');
                characterGrid.renderHot();
            },
            dragStop     : (e, ui) => {
                killSpace('#characters');
                keepInWindow(ui, '#characters');
                characterGrid.renderHot();
            }
        });
        
        $('#imageUploader').dialog({
            autoOpen : false,
            resizable: true,
            position : {at: 'center center'},
            title    : '画像登録',
            classes  : {
                "ui-dialog": "imageUploader"
            },
            buttons  : [],
            width    : 600,
            height   : 400,
            dragStop : function(e, ui) {
                keepInWindow(ui, '#imageUploader');
            },
            create   : function() {
                /*
                 * input要素を秘匿しておき、triggerで発火させる
                 */
                $('button[name=imagePicker]').on('click', function(e) {
                    $('input[name=image]').trigger('click');
                });
                /*
                 * ファイルを選択した時の処理
                 */
                $('input[name=image]').change(function() {
                    imageManager.onImagePick(this.files);
                });
                /*
                 * アップロードボタン、クリックイベントと秘匿
                 */
                $('button[name=imageUpload]').click(function() {
                    imageManager.upload()
                });
            },
            open     : function() {
                /*
                 * 共通タグを取得
                 */
                imageManager.initCommonTag();
                
            },
            close    : function() {
                /*
                 * 画像登録ウィンドウを閉じたら初期化する
                 */
                imageManager.initImages()
            }
        });
        
        $('#imageManager').dialog({
            autoOpen : false,
            resizable: true,
            position : {at: 'center center'},
            title    : '画像管理',
            classes  : {
                "ui-dialog": "imageManager"
            },
            buttons  : [],
            width    : 600,
            height   : 400,
            dragStop : function(e, ui) {
                keepInWindow(ui, '#imageManager');
            },
            create   : function() {
            },
            open     : function() {
            },
            close    : function() {
            }
        });
        
        $('.ui-dialog-titlebar-close').each((i, v) => {
            // $(v).css('display', 'none');
        });
        
        $('[role=dialog]').each((i, v) => {
            $(v).css('position', 'fixed');
        });
    })
    .focus(() => {
        /*
         * ウィンドウがアクティブに戻ったらプロンプトにフォーカスを当てる
         */
        $('#m').focus();
        textForm.onType();
    })
    .blur(() => {
        /*
         * ウィンドウからフォーカスが外れたらフキダシを更新
         */
        textForm.onType(true, 'Mabo: ウィンドウを非アクティブにしてます。');
    });


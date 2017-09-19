"use strict";

const CU    = require('./commonUtil.js');
const trace = require('./_trace.js');
const Board = require('./_Board.js');
const Pawn  = require('./_Pawn.js');

let socket       = undefined;
const scenarioId = CU.getScenarioId();

/**
 * ボードを配置するオブジェクトに対応するクラス。
 *
 * @param _socket
 * @constructor
 */
let PlayGround = function(_socket) {
    socket        = _socket;
    this.boards   = [];
    this.selected = undefined;
    
    /*
     * DOMの追加
     */
    this.dom = $('<div></div>', {
        id : '#playGround',
        css: {
            "position"        : 'absolute',
            "top"             : '0px',
            "left"            : '0px',
            "width"           : '100%',
            "height"          : '100%',
            "background-color": '#eeeeee',
        }
    });
    
    $('div#northwest').append(this.dom);
    
    /*
     * ボード追加モーダルの初期化、イベント追加
     */
    let modalAddBoard = $('#modalAddBoard');
    let modalAddBoardInput = $(modalAddBoard).find('input');
    $(modalAddBoard).modal({
        startingTop: '4%',
        endingTop  : '10%',
    });
    $(modalAddBoard).find('.modal-action')
        .on('click', () => {
            let boardName = $(modalAddBoardInput).val().trim();
            this.createBoard(boardName);
        });
    
    $('#addBoard').on('click', () => {
        this.openModalDeployBoard();
    });
    
    /*
     * ボードの読み込み、表示
     */
    this.loadBoard(scenarioId);
    
    
    socket.on('deployBoards', (data) => {
        /*
         * 新規ボードをDBへ登録した後、他のユーザにそのボードを読み込み、DOMを作成させるリクエストを受信した際の処理
         */
        this.loadBoard(scenarioId);
    });
    
    /*
     * ボードをDBから削除した際、他のユーザにそのボードをDOMから削除させるリクエストを受信した際の処理
     */
    socket.on('destroyBoards', (data) => {
        this.destroyBoard(data.boardId);
    });
    
    /*
     * 新規コマをDBへ登録した後、他のユーザにそのコマを読み込み、DOMを作成させるリクエストを受信した際の処理
     */
    socket.on('deployPawns', (data) => {
        /*
         * キャラクタのコマをDBへ登録した後にコールする。
         * DBから指定した条件でコマをロードし、DOMとして配置する。
         */
        let boardId = data.boardId;
        this.getBoardById(boardId).loadPawn(data);
    });
    
    /*
     * コマをDBから削除した際、他のユーザにそのコマをDOMから削除させるリクエストを受信した際の処理
     */
    socket.on('destroyPawns', (data) => {
        let boardId = data.boardId;
        this.getBoardById(boardId).destroyCharacter(data.characterId, data.dogTag);
    });
};

/**
 * boardIdに紐づくボードオブジェクトを取得する
 *
 * @param boardId
 * @returns {*}
 */
PlayGround.prototype.getBoardById     = function(boardId) {
    return this.boards.find(function(v) {
        return v.id === boardId;
    })
};

/**
 * 最前面のボード(そのボードか、そのボードに紐づくコマをクリックした状態)を取得する
 * 取得に失敗した場合は-1を返却する
 *
 * @returns {*}
 */
PlayGround.prototype.getActiveBoardId = function() {
    let activeBoard = $('.board.board-front');
    if ($(activeBoard).length === 0) {
        return -1;
    }
    return $(activeBoard).attr('data-board-id');
};

/**
 * 全てのボードの深度をマークアップする。
 * 最前面のボードと、それ以外のボードについてクラスを付与
 *
 * @param boardId
 * @returns {boolean}
 */
PlayGround.prototype.popBoardUp       = function(boardId) {
    if (this.boards.length === 0) {
        return false;
    }
    
    this.boards.forEach(function(v) {
        if (v.id === boardId) {
            $(v.dom).css('z-index', '10')
                .addClass('z-depth-5')
                .addClass('board-front');
        } else {
            $(v.dom).css('z-index', '0')
                .removeClass('z-depth-5')
                .removeClass('board-front');
        }
    });
};

/**
 * クリックで選択したオブジェクトをマークアップする
 *
 * @param target
 */
PlayGround.prototype.selectObject = function(target) {
    
    let key = undefined;
    
    if (target instanceof Board) {
        key = 'board';
    }
    if (target instanceof Pawn) {
        key = 'pawn';
    }
    if (typeof key === 'undefined') {
        return false;
    }
    
    this.selected = [];
    
    switch (key) {
        case 'board':
            /*
             * ボードを選択し、他のボードと全てのコマの選択を解除
             */
            let boardId = target.id;
    
            this.boards.forEach((b) => {
                if (b.id === boardId) {
                    this.selected.push(b);
                }
            });
        
            break;
    
        case 'pawn':
            /*
             * コマを選択し、他のコマと全てのボードの選択を解除
             */
            let characterId = target.id;
            this.boards.forEach((b) => {
                b.characters.forEach((c) => {
                    if (c.id === characterId) {
                        this.selected.push(c)
                    }
                });
            });
        
            break;
        
        default:
            return false;
    }
};

/**
 * ボードのDOMを作成する。
 *
 * @param scenarioId
 * @param boardId
 */
PlayGround.prototype.loadBoard        = function(scenarioId, boardId) {
    /*
     * 指定したボードをDBから取得し、playGround.boardsに反映する。
     * boardIdを指定しない場合は、このシナリオに紐付く全てのボードを対象に取る。
     */
    let getAll = (typeof boardId === 'undefined');
    let data   = {
        scenarioId: scenarioId,
        boardId   : boardId,
        getAll    : getAll
    };
    let query  = CU.getQueryString(data);
    CU.callApiOnAjax(`/boards${query}`, 'get')
        .done((r) => {
            
            /*
             * boardsに反映
             */
            r.forEach((b) => {
                let boardId = b._id;
                let option  = {
                    name: b.name
                };
                let key     = b.key;
                let board   = new Board(socket, this, boardId, option, key);
                this.boards.push(board);
                this.popBoardUp(boardId);
                
            });
        })
    
};
/**
 * ボード作成用モーダルを開く
 */
PlayGround.prototype.openModalDeployBoard = function() {
    let modalAddBoard      = $('#modalAddBoard');
    let modalAddBoardInput = $(modalAddBoard).find('input');
    $(modalAddBoardInput).val('');
    $(modalAddBoard).modal();
    $(modalAddBoard).modal('open');
    $(modalAddBoard).find('.modal-action')
        .on('click', () => {
            let boardName = $(modalAddBoardInput).val().trim();
            this.createBoard(boardName);
        });
};

/**
 * ボードを新しく作成する。
 * Objectsコレクションの_idをユニークなボードIDに使用する。
 *
 * 新しいボードをObjectsコレクションに追加した後、
 * 他ユーザへボードIDを通知し、deployBoardsを送信する。
 *
 */
PlayGround.prototype.createBoard = function(boardName) {
    
    if (!boardName || boardName === '') {
        trace.warn('無効'); // @DELETEME
        return false;
    }
    
    let data = {
        scenarioId: scenarioId,
        name      : boardName
    };
    
    /*
     * ボード追加時にAPIを叩いて新規ボード登録、登録成功後にIDを受け取ってsocketで通知する
     * 作成したボードのidをAPIから取得する
     */
    CU.callApiOnAjax('/boards', 'post', {data: data})
        .done(function(r) {
            
            /*
             * 接続ユーザ全員にボードをリロードさせる
             */
            let data = {
                scenarioId: scenarioId,
                boardId   : r.boardId,
            };
            socket.emit('deployBoards', data);
        })
        .fail(function(r) {
        
        });
};

/**
 * ボードをDBから削除する処理。
 * 削除成功時は、該当するボードのDOMの削除リクエストを通知する。
 *
 * (ボード上のコマはAPIが削除する)
 */
PlayGround.prototype.removeBoard = function(boardId) {
    let q     = {
        scenarioId: scenarioId,
        boardId   : boardId,
    };
    let query = CU.getQueryString(q);
    CU.callApiOnAjax(`/boards${query}`, 'delete')
        .done((r) => {
            
            /*
             * ボード削除通知
             */
            let data = {
                scenarioId: scenarioId,
                boardId   : boardId
            };
            socket.emit('destroyBoards', data);
            
            /*
             * ボードその他を削除
             */
            this.destroyBoard(boardId);
        })
        .fail((r) => {
            alert('ボードの削除に失敗しました。オブジェクトを全てリロードします。');
            this.loadBoard(scenarioId);
        })
};
/**
 * ナビメニューのアイコン、ボードのインスタンスとDOMを削除する。
 * (ボードのインスタンスの削除と同時に、コマのインスタンスも削除する)
 *
 * @param boardId
 */
PlayGround.prototype.destroyBoard = function(boardId) {
    let targetIndex = this.boards.findIndex(function(v) {
        return v.id === boardId;
    });
    if (targetIndex !== -1) {
        $(this.boards[targetIndex].dom).remove();
        $(`span[data-board-indicator-id=${boardId}]`).remove();
        this.boards.splice(targetIndex, 1);
    }
};
/**
 * キャラクタ表からキャラクタを削除した際に呼び出す。キャラクタIDが等しいコマを全て削除する。
 * 全てのボードに対して実施し、ドッグタグは参照しない。
 *
 * @param characterId
 */
PlayGround.prototype.removePawnByAllBoard = function(characterId) {
    this.boards.forEach((v) => {
        let criteria = {
            scenarioId : scenarioId,
            boardId    : v.id,
            characterId: characterId
        };
        v.deleteCharacter(criteria);
    })
};

/**
 * 選択中のマップオブジェクトについて、画像割当メソッドをキックする
 *
 * @param imageInfo
 */
PlayGround.prototype.attachImage = function(imageInfo) {
    
    if (typeof this.selected === 'undefined') {
        console.warn('選択中のマップオブジェクトがありません'); // @DELETEME
        return false;
    }
    
    let selected = this.selected[0];
    
    /*
     * マップオブジェクトの画像をDBへ登録
     * (DOMの更新はsocketのイベントで行う)
     */
    selected.attachImage(imageInfo.key)
        .then((r) => {
            /*
             * ローカルのDOMを画像差し替え
             */
            this.selected.forEach((v) => {
                v.assignImage(imageInfo);
            });
            
            /*
             * 他クライアントへコマの再読込リクエスト
             */
            selected.sendReloadRequest(imageInfo);
        })
        .catch((e) => {
            console.error(e);
        });
    
};


module.exports = PlayGround;


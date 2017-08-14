"use strict";

const CU    = require('./commonUtil.js');
const trace = require('./_trace.js');
const Board = require('./_Board.js');

let socket       = undefined;
const scenarioId = CU.getScenarioId();

let PlayGround = function(_socket) {
    socket = _socket;
    
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
    let modalAddBoard      = $('#modalAddBoard');
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
    
};

PlayGround.prototype.setSocket        = function(_socket) {
    socket = _socket;
};
PlayGround.prototype.boards           = [];
PlayGround.prototype.getBoardById     = function(boardId) {
    return this.boards.find(function(v) {
        return v.id === boardId;
    })
};
PlayGround.prototype.getActiveBoardId = function() {
    let activeBoard = $('.board.playground-front');
    if ($(activeBoard).length === 0) {
        return -1;
    }
    return $(activeBoard).attr('data-board-id');
};
PlayGround.prototype.popBoardUp       = function(boardId) {
    if (this.boards.length === 0) {
        return false;
    }
    
    this.boards.forEach(function(v) {
        if (v.id === boardId) {
            $(v.dom).css('z-index', '10')
                .addClass('playground-front');
        } else {
            $(v.dom).css('z-index', '0')
                .removeClass('playground-front');
        }
    });
};
PlayGround.prototype.selectObject     = function(query) {
    /*
     * boardId、characterIdのうちどちらかのみ指定する
     */
    if (
        typeof query === 'undefined'
        ||
        (query.hasOwnProperty('boardId') && query.hasOwnProperty('characterId'))
        ||
        (!query.hasOwnProperty('boardId') && !query.hasOwnProperty('characterId'))
    ) {
        /*
         * プロパティを両方持っている、あるいは両方持っていない場合は終了
         */
        return false;
    }
    let key = '';
    if (query.hasOwnProperty('boardId') === true) {
        if (this.boards.length === 0) {
            return false;
        }
        key = 'boardId';
    } else if (query.hasOwnProperty('characterId') === true) {
        if (this.boards.length === 0) {
            return false;
        }
        key = 'characterId';
    } else {
        return false;
    }
    switch (key) {
        case 'boardId':
            /*
             * ボードを選択し、他のボードと全てのコマの選択を解除
             */
            let boardId = query.boardId;
            this.boards.forEach((b) => {
                if (b.id === boardId) {
                    $(b.dom).addClass('picked');
                } else {
                    $(b.dom).removeClass('picked');
                }
                b.characters.forEach((c) => {
                    $(c.dom).removeClass('picked');
                })
            });
            break;
        
        case 'characterId':
            /*
             * コマを選択し、他のコマと全てのボードの選択を解除
             */
            let characterId = query.characterId;
            this.boards.forEach((b) => {
                $(b.dom).removeClass('picked');
                b.characters.forEach((c) => {
                    if (c.id === characterId) {
                        $(c.dom).addClass('picked');
                    } else {
                        $(c.dom).removeClass('picked');
                    }
                });
            });
            break;
        
        default:
            return false;
    }
    
};
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
            r.forEach((v) => {
                let boardId = v._id;
                let option  = {
                    name: v.name
                };
                let board = new Board(socket, this, boardId, option);
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

module.exports = PlayGround;


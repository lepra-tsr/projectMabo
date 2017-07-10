"use strict";

const util       = require('./_util.js');
const _def       = require('./_def.js');
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = require('./_trace.js');
const Board      = require('./_Board.js');

let socket = undefined;

let playGround              = {};
playGround.setSocket        = function(_socket) {
    socket = _socket;
};
playGround.boards           = [];
playGround.getBoardById     = function(boardId) {
    return this.boards.find(function(v) {
        return v.id === boardId;
    })
};
playGround.getActiveBoardId = function() {
    let activeBoard = $('.board.playground-front');
    if ($(activeBoard).length === 0) {
        return -1;
    }
    return $(activeBoard).attr('data-board-id');
};
playGround.popBoardUp       = function(boardId) {
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
playGround.loadBoard        = function(scenarioId, boardId) {
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
    let query  = util.getQueryString(data);
    util.callApiOnAjax(`/boards${query}`, 'get')
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
playGround.deployBoard      = function() {
    /*
     * ボードを新しく作成する。
     * Objectsコレクションの_idをユニークなボードIDに使用する。
     *
     * 新しいボードをObjectsコレクションに追加した後、
     * 他ユーザへボードIDを通知し、deployBoardsを送信する。
     */
    let boardName = window.prompt('追加するボードに名前を付けてください。\nマウスポインタを乗せた際の注釈などに使用します。').trim();
    if (!boardName || boardName === '') {
        trace.warn('無効'); // @DELETEME
        return false;
    }
    
    let data = {
        scenarioId: scenarioId,
        name      : boardName
    };
    
    /*
     * ボード追加時にAPI叩いて登録、ID受け取ってsocketで通知
     * 作成したボードのidをAPIから取得する
     */
    util.callApiOnAjax('/boards', 'post', {data: data})
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
playGround.removeBoard = function(boardId) {
    let q     = {
        scenarioId: scenarioId,
        boardId   : boardId,
    };
    let query = util.getQueryString(q);
    util.callApiOnAjax(`/boards${query}`, 'delete')
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
playGround.destroyBoard = function(boardId) {
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
playGround.removePawnByAllBoard = function(characterId) {
    this.boards.forEach((v) => {
        let criteria = {
            scenarioId : scenarioId,
            boardId    : v.id,
            characterId: characterId
        };
        v.deleteCharacter(criteria);
    })
};

module.exports = playGround;


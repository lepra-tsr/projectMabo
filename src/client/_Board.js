"use strict";

const util       = require('./_util.js');
const _def       = require('./_def.js');
const scenarioId = /\/scenarios\/([a-f0-9]+)/.exec(window.location.href)[1];
const trace      = require('./_trace.js');
const Pawn       = require('./_Pawn.js');

let socket     = undefined;
let playGround = undefined;

let Board                        = function(_socket, _playGround, id, option) {
    this.id         = id;
    this.characters = [];
    socket          = _socket;
    playGround      = _playGround;
    this.dom        =
        $('<div></div>', {
            width   : '200px',
            height  : '200px',
            addClass: 'board',
            css     : {
                "background-color" : 'lightgray',
                "background-image" : "url('/img/number_5.jpeg')",
                "background-size"  : '614px 614px',
                "background-repeat": 'no-repeat',
                "opacity"          : '0.95',
                "position"         : 'absolute',
                "top"              : '0px',
                "left"             : '0px',
                "z-index"          : '0',
                "cursor"           : 'move',
                "font-size"        : '10px'
            },
        });
    
    if (playGround.boards.some(function(v) {
            return v.id === id
        })) {
        trace.warn('同じBoardが既に存在しています。'); // @DELETEME
        return
    }
    
    $(this.dom)
        .attr('data-board-id', id)
        .attr('title', `board: ${option.name}`)
        .text(`[board] ${option.name}:${id}`)
        .draggable({
            grid : [5, 5],
            start: () => {
                playGround.popBoardUp(id);
            }
        })
        .resizable({
            ghost  : true,
            animate: true
        })
        .on('click', () => {
            playGround.popBoardUp(id);
        })
        .on('contextmenu', (e) => {
            let menuProperties = {
                items   : [
                    {
                        key : 'destroy',
                        name: 'ボードを削除'
                    },
                    {
                        key : 'setImage',
                        name: '画像を割り当て'
                    }
                ],
                callback: (e, key) => {
                    switch (key) {
                        case 'destroy':
                            let confirm = window.confirm(`ボード『${option.name}』を削除しますか？`);
                            if (confirm !== true) {
                                return false;
                            }
                            playGround.removeBoard(id);
                            break;
                        case 'setImage':
        
                            break;
                        default:
                            break;
                    }
                }
            };
            util.contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    $('#playGround').append(this.dom);
    
    /*
     * ナビにボタンを追加
     */
    $('#addBoard')
        .before(
            $(`<span></span>`,
                {
                    "addClass"               : 'ml-3',
                    "data-board-indicator-id": id
                })
                .append(
                    $(`<i>${option.name}</i>`).addClass('fa fa-toggle-right')
                ));
    trace.log(`ボード: ${option.name}を作成しました！`);
    
    /*
     * ボードに紐づくコマを読み込んで表示する
     */
    let criteria = {boardId: this.id};
    this.loadPawn(criteria);
};
Board.prototype.getCharacterById = function(characterId, dogTag) {
    let character = this.characters.find(function(v) {
        return (v.id === characterId && v.dogTag === dogTag);
    });
    return character;
};
Board.prototype.getDogTag        = function(characterId) {
    
    if (typeof characterId === 'undefined') {
        return undefined;
    }
    
    let characters = this.characters.filter(function(v) {
        return v.id === characterId;
    });
    if (characters.length === 0) {
        return 0
    }
    
    let dogTagMax = parseInt(characters.reduce(function(a, b) {
        return (a.dogTag >= b.dogTag) ? a : b
    }).dogTag, 10);
    
    return dogTagMax + 1
};
/**
 * キャラクタの駒のDOMを作成する。
 * @param _characterId
 * @param _dogTag
 * @param meta
 */
Board.prototype.deployCharacter = function(_characterId, _dogTag, meta) {
    trace.log(`コマ作成。 characterId:${_characterId}, dogTag:${_dogTag}`);
    let that    = this;
    let boardId = this.id;
    let pawn    = new Pawn(socket, playGround, boardId, _characterId, _dogTag, meta);
    that.characters.push(pawn)
};
/**
 * シナリオとボードに紐づく駒を、新しくDBへ登録する。
 * ドッグタグはDB側で採番する。
 * 登録成功時は自分を含め、全員へ通知。
 *
 * @param characterId
 */
Board.prototype.registerCharacter = function(characterId) {
    let data = {
        scenarioId : scenarioId,
        boardId    : this.id,
        characterId: characterId,
        top        : 0,
        left       : 0
    };
    util.callApiOnAjax('/pawns', 'post', {data: data})
        .done(function(r) {
            /*
             * 登録したpawnの情報を受け取る
             */
            let payLoad = {
                scenarioId : scenarioId,
                pawnId     : r.pawnId,
                boardId    : r.boardId,
                characterId: r.characterId,
                dogTag     : r.dogTag,
            };
            trace.log(`DBへコマを新しく登録しました。`);
            socket.emit('deployPawns', payLoad);
        })
        .fail(function(r) {
        });
};
/**
 * DBから、シナリオとボードに紐づく駒の情報を取得する。
 * キャラクタIDを指定した場合、その条件で絞り込む。
 *
 * @param characterId
 */
Board.prototype.loadCharacter = function(characterId) {
    
    let dogTag  = this.getDogTag(characterId);
    let boardId = this.id;
    let data    = {
        scenarioId : scenarioId,
        boardId    : boardId,
        characterId: characterId,
        dogTag     : dogTag,
        top        : 0,
        left       : 0
    };
    util.callApiOnAjax('/pawns', 'get', {data: data})
        .done(function(r) {
            return r;
        })
        .fail(function() {
            return undefined;
        })
};
/**
 * ボード上の駒のDOMを削除する。指定方法はキャラクターIDとドッグタグ。
 * ドッグタグのみの指定はできない。
 * 指定しない場合、その条件については絞り込まず、該当する全ての駒を削除する。
 *
 * @param characterId
 * @param dogTag
 */
Board.prototype.destroyCharacter = function(characterId, dogTag) {
    trace.info(`ボード:${this.id} から、コマ ${characterId} - ${dogTag} を削除。`);
    /*
     * charactersへのポインタ
     */
    let characters = playGround.getBoardById(this.id).characters;
    for (let i = 0; i < characters.length; i++) {
        let character = characters[i];
        if (character.id === characterId && character.dogTag === dogTag) {
            /*
             * DOMから削除し、ボードのキャラクタ配列からも削除する。
             */
            $(characters[i].dom).remove();
            characters.splice(i, 1);
        }
    }
};
/**
 * DBから対象のコマを削除する。
 * 削除成功時はdestroyPawns=コマのDOM削除リクエストを送信する。
 *
 * @param criteria
 */
Board.prototype.deleteCharacter = function(criteria) {
    let query = util.getQueryString(criteria);
    util.callApiOnAjax(`/pawns${query}`, 'delete')
        .done(function(deletedDocs) {
            /*
             * DOM削除リクエストの送信
             */
            trace.log('DBからコマ情報を削除しました。');
            if (deletedDocs.length === 0) {
                return false;
            }
            deletedDocs.forEach(function(d) {
                socket.emit('destroyPawns', d);
            })
        })
        .fail(function(r) {
            trace.warn('DBからコマを削除しようとしましたが、失敗しました。');
            trace.error(r);
        })
};
/**
 * deployPawnsからコールする。
 * コマをDBへ登録した通知を受け取った際のDOM作成処理。
 *
 * @param criteria
 */
Board.prototype.loadPawn = function(criteria) {
    trace.log('DBからコマの情報を取得中です。');
    let query = util.getQueryString(criteria);
    util.callApiOnAjax(`/pawns${query}`, 'get')
        .done(function(result) {
            for (let i = 0; i < result.length; i++) {
                let r           = result[i];
                let boardId     = r.boardId;
                let characterId = r.characterId;
                let dogTag      = r.dogTag;
                let meta        = r.meta;
                playGround.getBoardById(boardId).deployCharacter(characterId, dogTag, meta);
            }
        })
        .fail(function() {
            trace.warn('DBからコマ情報を取得する際にエラーが発生しました。');
        })
};

module.exports = Board;


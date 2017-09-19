"use strict";

const CU    = require('./commonUtil.js');
const trace = require('./_trace.js');
const Pawn  = require('./_Pawn.js');

const scenarioId = CU.getScenarioId();
let socket       = undefined;
let playGround   = undefined;

/**
 * コマを載せるボードオブジェクトに対応するクラス。
 *
 * @param _socket
 * @param _playGround
 * @param id
 * @param option
 * @param key
 * @constructor
 */
let Board = function(_socket, _playGround, id, option, key) {
    this.id         = id;
    this.characters = [];
    socket          = _socket;
    playGround      = _playGround;
    this.key        = key;
    
    /*
     * 作成後、デフォルトは200x200の灰色
     */
    this.dom        =
        $('<div></div>', {
            width   : '200px',
            height  : '200px',
            addClass: 'board',
            css     : {
                "background-color" : 'lightgray',
                "background-repeat": 'no-repeat',
                "opacity"          : '0.35',
                "position"         : 'absolute',
                "top"              : '0px',
                "left"             : '0px',
                "z-index"          : '0',
                "cursor"           : 'move',
                "font-size"        : '10px'
            },
        });
    
    /*
     * 非同期で画像割当
     */
    if (typeof key !== 'undefined') {
        
        let query = CU.getQueryString({key: key});
        
        CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
            .done((r) => {
                $(this.dom).css({
                    "background-image" : `url("${r.uri}")`,
                    "background-size"  : `${r.width}px ${r.height}px`,
                    "background-repeat": 'no-repeat',
                    "width"            : `${r.width}px`,
                    "height"           : `${r.height}px`,
                })
            })
            .fail((r) => {
                console.error(r);
                return false;
            })
    }
    
    if (playGround.boards.some(function(v) {
            return v.id === id
        })) {
        console.warn('同じBoardが既に存在しています。');
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
        .on('click', () => {
            /*
             * クリックで選択可能にする
             */
            playGround.popBoardUp(id);
            playGround.selectObject(this)
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
                            /*
                             * ボードを選択状態にし、画像設定
                             */
                            playGround.selectObject({boardId: id});
                            break;
                        default:
                            break;
                    }
                }
            };
            CU.contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    $('#playGround').append(this.dom);
    
    /*
     * ナビにボタンを追加
     */
    $('#addBoard')
        .on('click',()=>{
            playGround.openModalDeployBoard();
        })
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
    
    /*
     * 画像の参照先変更リクエスト
     */
    socket.on('attachBoardImage', (data) => {
        let imageInfo = data.imageInfo;
        this.assignImage(imageInfo);
    })
};

/**
 * 属するコマオブジェクトから、characterIdとdogTagが一致する物を取得する
 *
 * @param characterId
 * @param dogTag
 * @returns {*}
 */
Board.prototype.getCharacterById = function(characterId, dogTag) {
    let character = this.characters.find(function(v) {
        return (v.id === characterId && v.dogTag === dogTag);
    });
    return character;
};

/**
 * characterIdに対応するコマを参照し、新しく採番するdogTagを返却する。
 * コマを追加する際に使用する
 *
 * @param characterId
 * @returns {*}
 */
Board.prototype.getDogTag = function(characterId) {
    
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
 *
 * @param _characterId
 * @param _dogTag
 * @param meta
 * @param key
 */
Board.prototype.deployCharacter = function(_characterId, _dogTag, meta, key) {
    trace.log(`コマ作成。 characterId:${_characterId}, dogTag:${_dogTag}`);
    let pawn = new Pawn(socket, playGround, this.id, _characterId, _dogTag, meta, key);
    this.characters.push(pawn)
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
    CU.callApiOnAjax('/pawns', 'post', {data: data})
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
    CU.callApiOnAjax('/pawns', 'get', {data: data})
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
    let query = CU.getQueryString(criteria);
    CU.callApiOnAjax(`/pawns${query}`, 'delete')
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
    let query = CU.getQueryString(criteria);
    CU.callApiOnAjax(`/pawns${query}`, 'get')
        .done((result) => {
            for (let i = 0; i < result.length; i++) {
                let r           = result[i];
                let boardId     = r.boardId;
                let characterId = r.characterId;
                let dogTag      = r.dogTag;
                let meta        = r.meta;
                let key         = r.key;
                this.deployCharacter(characterId, dogTag, meta, key);
            }
        })
        .fail(() => {
            trace.warn('DBからコマ情報を取得する際にエラーが発生しました。');
        })
};

/**
 * Domの画像の参照先を変更する
 *
 * @param imageInfo
 */
Board.prototype.assignImage = function(imageInfo) {
    
    let src    = imageInfo.src;
    let width  = imageInfo.width;
    let height = imageInfo.height;
    
    let meta = {
        "background-image" : `url("${src}")`,
        "background-size"  : `${width}px ${height}px`,
        "background-repeat": 'no-repeat',
        "width"            : `${width}px`,
        "height"           : `${height}px`,
    };
    
    Object.keys(meta).forEach((v) => {
        $(this.dom).css(`${v}`, `${meta[v]}`);
    });
};

/**
 * 画像の割当を行うメソッド。
 * @param key
 */
Board.prototype.attachImage = function(key) {
    
    let payload = {
        scenarioId: scenarioId,
        boardId   : this.id,
        key       : key
    };
    
    return CU.callApiOnAjax('/boards', 'patch', {data: payload})
};

/**
 * ボードの更新リクエスト
 */
Board.prototype.sendReloadRequest = function(imageInfo) {
    let payload = {
        scenarioId: scenarioId,
        boardId   : this.id,
        imageInfo : imageInfo
    };
    socket.emit('attachBoardImage', payload);
};

module.exports = Board;


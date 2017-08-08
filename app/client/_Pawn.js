"use strict";

const util       = require('./_util.js');
const scenarioId = util.getScenarioId();
const trace      = require('./_trace.js');

let socket     = undefined;
let playGround = undefined;

/**
 * コマのプロトタイプ。
 * ボード(boardId)、キャラクタ表の行(characterId)、dogTagとの組み合わせで一意に定まる。
 * @param _socket
 * @param _playGround
 * @param boardId
 * @param characterId
 * @param dogTag
 * @param meta
 * @constructor
 */
let Pawn               = function(_socket, _playGround, boardId, characterId, dogTag, meta) {
    this.boardId = boardId;
    this.id      = characterId;
    this.dogTag  = dogTag;
    socket       = _socket;
    playGround   = _playGround;
    this.style   = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('style') )
        ? meta.style
        : {};
    this.attr    = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('attr') )
        ? meta.attr
        : {};
    
    /*
     * DOM初期設定
     */
    this.dom = $('<div></div>', {
        width : '50px',
        height: '50px',
        css   : {
            "background-color": '#00B7FF',
            "position"        : 'absolute'
        },
    })
        .attr('data-board-id', boardId)
        .attr('data-character-id', characterId)
        .attr('data-character-dog-tag', dogTag)
        .html(`${characterId}-${dogTag}</br>${boardId}`);
    
    /*
     * styleの指定があった場合は上書き
     */
    let styleKeys = Object.keys(this.style).filter(function(v) {
        return v.trim() !== ''
    });
    if (styleKeys.length !== 0) {
        $(this.dom).css(this.style);
    }
    
    /*
     * attrの指定があった場合は上書き
     */
    let attrKeys = Object.keys(this.attr).filter(function(v) {
        return v.trim() !== ''
    });
    if (attrKeys.length !== 0) {
        for (let i = 0; i < attrKeys.length; i++) {
            let key   = attrKeys[i];
            let value = this.attr[key];
            $(this.dom).attr(key, value);
        }
    }
    
    /*
     * クリックで選択できるようにする
     */
    $(this.dom)
        .on('click', (e) => {
            /*
             * コマの中から選択状態に
             */
            playGround.selectObject({characterId: this.id});
            
            /*
             * 紐付け先のボードを全面へ
             */
            playGround.popBoardUp(boardId);
            
            e.stopPropagation();
        });
    
    /*
     * jQuery-UI のdraggableウィジェット設定
     */
    $(this.dom)
        .draggable({
            grid : [1, 1],
            start: function(e, ui) {
            },
            stop : function(e) {
                /*
                 * ドラッグ終了時、座標を取得してsocketで通知する
                 */
                let axis = {
                    top : $(e.target).css('top'),
                    left: $(e.target).css('left')
                };
                let data = {
                    scenarioId : scenarioId,
                    boardId    : boardId,
                    characterId: characterId,
                    dogTag     : dogTag,
                    axis       : axis
                };
                socket.emit('movePawns', data);
            },
        });
    
    /*
     * 右クリック時の処理をオーバーライド
     */
    $(this.dom)
        .on('contextmenu', (e) => {
            let menuProperties = {
                items   : [
                    {
                        key : 'setImage',
                        name: 'この駒に画像を割り当てる'
                    },
                    {
                        key : 'destroy',
                        name: 'この駒を削除'
                    },
                    {
                        key : 'copy',
                        name: 'このキャラクタの駒を1個増やす'
                    }
                ],
                callback: (e, key) => {
                    switch (key) {
                        case 'setImage':
                            playGround.selectObject({characterId: characterId});
                            break;
                        case 'destroy':
                            let confirm = window.confirm(`この駒を削除してもよろしいですか？`);
                            if (confirm !== true) {
                                return false;
                            }
                            let criteria = {
                                scenarioId : scenarioId,
                                boardId    : boardId,
                                characterId: characterId,
                                dogTag     : dogTag
                            };
                            playGround.getBoardById(boardId).deleteCharacter(criteria);
                            
                            break;
                        case 'copy':
                            playGround.getBoardById(boardId).loadCharacter(characterId);
                            break;
                    }
                }
            };
            util.contextMenu(e, menuProperties);
            e.stopPropagation();
        });
    
    /*
     * DOMツリーに追加
     */
    $(playGround.getBoardById(boardId).dom).append(this.dom);
    trace.info(`Pawnをボード:${this.boardId}に作成。`);
};
Pawn.prototype.getMeta = function() {
    let styles     = [
        'top',
        'left',
        'width',
        'height',
        'background-color',
        'opacity'
    ];
    let attributes = [
        'title',
    ];
    
    let meta = {
        style: {},
        attr : {}
    };
    for (let i = 0; i < styles.length; i++) {
        let style = styles[i].trim();
        if (style === '') {
            continue;
        }
        meta.style[style] = $(this.dom).css(style);
    }
    for (let j = 0; j < attributes.length; j++) {
        let attribute = attributes[j].trim();
        if (attribute === '') {
            continue;
        }
        meta.attr[attribute] = $(this.dom).attr(attribute);
    }
    
    return meta
};
Pawn.prototype.setMeta = function(_meta) {
    /*
     * 要素にstyleもattrも持っていない場合は終了
     */
    if ((!_meta.hasOwnProperty('style')) && (!_meta.hasOwnProperty('attr'))) {
        return false;
    }
    let meta = {};
    /*
     * 要素の指定があった場合は、それぞれについてコマに適用
     */
    meta.style    = _meta.hasOwnProperty('style') ? _meta.style : {};
    meta.attr     = _meta.hasOwnProperty('attr') ? _meta.attr : {};
    let keysStyle = Object.keys(meta.style);
    for (let i = 0; i < keysStyle.length; i++) {
        let key   = keysStyle[i].trim();
        let value = meta.style[key];
        if (key === '') {
            continue;
        }
        $(this.dom).css(key, value);
    }
    let keysAttr = Object.keys(meta.attr);
    for (let i = 0; i < keysAttr.length; i++) {
        let key   = keysAttr[i].trim();
        let value = meta.style[key];
        if (key === '') {
            continue;
        }
        $(this.dom).attr(key, value);
    }
    return false;
};

module.exports = Pawn;
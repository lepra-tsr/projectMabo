"use strict";

const CU           = require('./commonUtil.js');
const toast        = require('./_toast.js');
const ImageManager = require('./_ImageManager.js');
const Animate      = require('./_Animate.js');
const Mediator     = require('./_Mediator.js');
const mediator     = new Mediator();
const confirm      = require('./_confirm.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class Pawn {
  /**
   * コマのプロトタイプ。
   * ボード(boardId)、キャラクタ表の行(characterId)、dogTagとの組み合わせで一意に定まる。
   * @param _socket
   * @param boardId
   * @param characterId
   * @param dogTag
   * @param name
   * @param meta
   * @param key
   * @constructor
   */
  constructor(boardId, characterId, dogTag, name, meta, key) {
    this.boardId = boardId;
    this.id      = characterId;
    this.dogTag  = dogTag;
    this.name    = name || '';
    this.width   = 50;
    this.height  = 50;
    this.style   = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('style') ) ? meta.style : {};
    this.attr    = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('attr') ) ? meta.attr : {};
    this.key     = key;
    
    /*
     * DOM初期設定。50x50で固定
     */
    this.dom = $('<div></div>', {
      width : `${this.width}px`,
      height: `${this.height}px`,
      css   : {
        "background-color": '#00B7FF',
        "position"        : 'absolute'
      },
    })
      .attr({
        'data-board-id'         : boardId,
        'data-character-id'     : characterId,
        'data-character-dog-tag': dogTag,
      })
      .html(`${characterId}-${dogTag}</br>${boardId}`);
    
    /*
     * 非同期で画像割当
     */
    this.setImageSrc(key);
    
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
     * クリックした場合、同じキャラクタIDに紐づくコマを全て選択状態にする
     */
    $(this.dom).on('click', (e) => {
        mediator.emit('pawn.clicked', this);
        e.stopPropagation();
      });
    
    /*
     * jQuery-UI のdraggableウィジェット設定
     */
    $(this.dom).draggable({
        grid : [1, 1],
        start: (e, ui) => {
          $(this.dom).css({transition: 'none'})
        },
        stop : (e) => {
          /*
           * ドラッグ終了時、座標を取得してsocketで通知する
           */
          let axis = {
            top : $(e.target).css('top'),
            left: $(e.target).css('left'),
          };
          let data = {
            scenarioId : sInfo.id,
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
    $(this.dom).on('contextmenu', (e) => {
        let menuProperties = {
          items   : [
            {key: 'setImage', name: 'この駒に画像を割り当てる'},
            {key: 'destroy', name: 'この駒を削除'},
            {key: 'copy', name: 'このキャラクタの駒を1個増やす'}
          ],
          callback: contextMenuCallback.bind(this)
        };
      CU.contextMenu(e, menuProperties);
      e.stopPropagation();
    
      function contextMenuCallback(e, key) {
        switch (key) {
          case 'setImage':
            mediator.emit('pawn.selectObject', this);
            let im = new ImageManager((imageInfo) => {
              /*
               * 画像管理ダイアログで割当ボタンを押下した際のコールバック
               */
              this.attachImage(imageInfo.key)
                .then((r) => {
                  /*
                   * DBへ登録成功後、ローカルのDOM画像を差し替え、ソケットで通知
                   */
                  this.assignImage(imageInfo);
                  this.sendReloadRequest(imageInfo);
                })
                .catch((e) => {
                  console.error(e);
                })
            });
            break;
          case 'destroy':
  
            confirm('コマの削除', `削除してもよろしいですか？`, 'removePawnConfirm')
              .then(() => {
                let criteria = {
                  scenarioId : sInfo.id,
                  boardId    : boardId,
                  characterId: characterId,
                  dogTag     : dogTag
                };
                mediator.emit('board.deleteCharacter', criteria);
              })
              .catch(() => {
                // cancel
              });
            break;
          case 'copy':
            mediator.emit('board.loadCharacter', boardId, characterId);
            break;
        }
      }
      });
    
    /*
     * DOMツリーに追加
     */
    mediator.emit('board.appendPawn', this);
    toast(`コマを作成しました。`);
    
    /*
     * コマの移動の通知があった場合
     */
    socket.on('movePawns', movePawns.bind(this));
  
    /*
     * 画像の参照先変更通知があった場合
     */
    socket.on('attachPawnImage', attachPawnImage.bind(this));
  
    function movePawns(data) {
      let boardId     = data.boardId;
      let characterId = data.characterId;
      let dogTag      = data.dogTag;
      if (
        this.boardId === boardId && this.id === characterId && this.dogTag === dogTag
      ) {
  
        let meta = {style: data.axis};
        this.setMeta(meta);
  
        Animate.pop(this.dom);
      }
    }
  
    function attachPawnImage(data) {
      let characterId = data.characterId;
      if (characterId !== this.id) {
        return false;
      }
      let imageInfo = data.imageInfo;
      this.assignImage(imageInfo);
    }
  }
  
  /**
   * 画像キーを参照し、画像の参照先を指定する。
   * @param key
   * @returns {boolean}
   */
  setImageSrc(key) {
    if (typeof key === 'undefined') {
      return false;
    }
    
    let query = CU.getQueryString({key: key});
    
    CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
      .done((r) => {
        this.assignImage({src: r.uri});
      })
      .fail((r) => {
        console.error(r);
        return false;
      })
    
  }
  
  /**
   * Domの画像の参照先を変更する
   */
  assignImage(imageInfo) {
    
    let src = imageInfo.src;
    
    let meta = {
      style: {
        "background-image" : (src) ? `url("${src}")` : 'none',
        "background-size"  : `${this.width}px ${this.height}px`,
        "background-repeat": 'no-repeat',
        "border-radius"    : '0.2em',
        "width"            : `${this.width}px`,
        "height"           : `${this.height}px`,
      }
    };
    
    this.setMeta(meta);
  }
  
  setMeta(_meta) {
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
  
      $(this.dom).css({transition: 'top 0.5s ease-in-out, left 0.5s ease-in-out'});
      $(this.dom).css(key, value);
      setTimeout(() => {
        $(this.dom).css({transition: 'none'})
      }, 1000);
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
  }
  
  /**
   * 画像の割当情報をDBへ書き込む
   *
   * @param key
   */
  attachImage(key) {
    
    let payload = {
      scenarioId : sInfo.id,
      characterId: this.id,
      key        : key
    };
    
    return CU.callApiOnAjax(`/pawns`, 'patch', {data: payload})
  }
  
  /**
   * コマ情報の更新リクエスト
   */
  sendReloadRequest(imageInfo) {
    let payload = {
      scenarioId : sInfo.id,
      characterId: this.id,
      imageInfo  : imageInfo
    };
    socket.emit('attachPawnImage', payload);
  }
}

module.exports = Pawn;
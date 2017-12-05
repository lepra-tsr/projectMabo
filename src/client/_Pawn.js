"use strict";

const CU           = require('./commonUtil.js');
const toast        = require('./_toast.js');
const ImageManager = require('./_ImageManager.js');
const Animate      = require('./_Animate.js');
const Mediator     = require('./_Mediator.js');
const mediator     = new Mediator();
const confirm      = require('./_confirm.js');
const ContextMenu  = require('./_ContextMenu.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class Pawn {
  
  /**
   * コマのプロトタイプ。
   * ボード(boardId)、キャラクタ表の行(characterId)、dogTagとの組み合わせで一意に定まる。
   * @param boardId
   * @param characterId
   * @param dogTag
   * @param name
   * @param meta
   * @param key
   * @constructor
   */
  constructor(boardId, characterId, dogTag, name, meta, key) {
  
    if (typeof Pawn.instances === 'undefined') {
      Pawn.instances = [];
    }
  
    let instances = Pawn.get({boardId: boardId, id: characterId, dogTag: dogTag});
  
    if (instances.length === 1) {
      return instances[0]
    }
  
    Pawn.instances.push(this);
    
    this.boardId = boardId;
    this.id      = characterId;
    this.dogTag  = dogTag;
    this.name    = name || '';
    this.width   = 50;
    this.height  = 50;
    this.style   = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('style') ) ? meta.style : {};
    this.attr    = ( typeof  meta !== 'undefined' && meta.hasOwnProperty('attr') ) ? meta.attr : {};
    this.key     = key;
  
    this.render();
  
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
      
        Animate.pop(this.$dom);
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
  
  render() {
    /*
     * DOM初期設定。50x50で固定
     */
    this.$dom = $('<div></div>', {
      width   : `${this.width}px`,
      height  : `${this.height}px`,
      addClass: 'pawn',
      css     : {
        "border"          : '1px solid black',
        "background-color": '#00B7FF',
        "position"        : 'absolute'
      },
    })
      .attr({
        'data-board-id'         : this.boardId,
        'data-character-id'     : this.id,
        'data-character-dog-tag': this.dogTag,
      })
      .html(`${this.id}-${this.dogTag}</br>${this.boardId}`);
    
    /*
     * 非同期で画像割当
     */
    this.setImageSrc(this.key);
    
    /*
     * styleの指定があった場合は上書き
     */
    let styleKeys = Object.keys(this.style).filter(function(v) {
      return v.trim() !== ''
    });
    if (styleKeys.length !== 0) {
      this.$dom.css(this.style);
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
        this.$dom.attr(key, value);
      }
    }
    
    /*
     * クリックした場合、同じキャラクタIDに紐づくコマを全て選択状態にする。
     * 加えてボードも選択状態にする。
     */
    this.$dom.on('click', (e) => {
      mediator.emit('playGround.popUp', this);
      e.stopPropagation();
    });
    
    /*
     * jQuery-UI のdraggableウィジェット設定
     */
    this.$dom.draggable({
      grid : [1, 1],
      start: () => {
        this.$dom.css({transition: 'none'})
      },
      stop : () => {
        /*
         * ドラッグ終了時、座標を取得してsocketで通知する
         */
        let axis = {
          top : this.$dom.css('top'),
          left: this.$dom.css('left'),
        };
        let data = {
          scenarioId : sInfo.id,
          boardId    : this.boardId,
          characterId: this.id,
          dogTag     : this.dogTag,
          axis       : axis
        };
    
        socket.emit('movePawns', data);
      },
    });
    
    /*
     * 右クリック時の処理をオーバーライド
     */
    new ContextMenu(this.$dom, {id: 'contextmenu-pawn'}, [
        {key: 'setImage', label: 'この駒に画像を割り当てる', callback: setImageCallback.bind(this)},
        {key: 'destroy', label: 'この駒を削除', callback: destroyCallback.bind(this)},
        {key: 'copy', label: 'このキャラクタの駒を1個増やす', callback: copyCallback.bind(this)}
      ]
    );
    
    function setImageCallback() {
      this.select();
      mediator.emit('playGround.popUp', this);
      new ImageManager((imageInfo) => {
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
    }
    
    function destroyCallback() {
      confirm('コマの削除', `削除してもよろしいですか？`, 'removePawnConfirm')
        .then(() => {
          Pawn.removeFromDB(this.uniqueKey);
        })
        .catch(() => {
          // cancel
        });
    }
    
    function copyCallback() {
      mediator.emit('board.loadCharacter', boardId, characterId);
    }
    
    /*
     * DOMツリーに追加
     */
    mediator.emit('board.appendPawn', this);
    toast(`コマを作成しました。`);
  }
  
  die() {
    Pawn.removeFromDom({boardId: this.boardId, id: this.id, dogTag: this.dogTag});
  }
  
  get uniqueKey() {
    return {boardId: this.boardId, id: this.id, dogTag: this.dogTag};
  }
  
  /**
   * 全てのコマから条件でフィルタした結果の、コマの配列を返却する。
   *
   * @param criteria
   * @return Array
   */
  static get(criteria) {
    let result = Pawn.instances.filter((p) => {
      let boardIdCheck = (criteria.hasOwnProperty('boardId') && typeof criteria.boardId !== 'undefined')
        ? criteria.boardId === p.boardId
        : true;
      let idCheck      = (criteria.hasOwnProperty('id') && typeof criteria.id !== 'undefined')
        ? criteria.id === p.id
        : true;
      let dogTagCheck  = (criteria.hasOwnProperty('dogTag') && typeof criteria.dogTag !== 'undefined')
        ? criteria.dogTag === p.dogTag
        : true;
      
      return boardIdCheck && idCheck && dogTagCheck
    });
    
    return result;
  }
  
  select() {
    Pawn.select({boardId: this.boardId, id: this.id, dogTag: this.dogTag});
  }
  
  /**
   * コマを強調表示し、同じキャラクタIDのコマも強調表示する
   *
   * @param criteria
   */
  static select(criteria) {
    let boardId = criteria.boardId;
    let id      = criteria.id;
    let dogTag  = criteria.dogTag;
    
    Pawn.instances.forEach((p) => {
      if (p.id === id) {
        p.$dom.addClass('pawn-select');
        if (p.boardId === boardId && p.dogTag === dogTag) {
          p.$dom.addClass('pawn-clicked');
        } else {
          p.$dom.removeClass('pawn-clicked');
        }
      } else {
        p.$dom.removeClass('pawn-select');
      }
    })
  }
  
  /**
   * DBからコマデータを削除し、DOM削除リクエストを送信する
   * @param _criteria
   */
  static removeFromDB(_criteria) {
    
    let criteria = {
      scenarioId : sInfo.id,
      boardId    : _criteria.boardId,
      characterId: _criteria.id,
      dogTag     : _criteria.dogTag
    };
    
    let query = CU.getQueryString(criteria);
    CU.callApiOnAjax(`/pawns${query}`, 'delete')
      .done((deletedDocs) => {
        /*
         * DOM削除リクエストの送信
         */
        toast('DBからコマ情報を削除しました。');
        if (deletedDocs.length === 0) {
          return false;
        }
        
        socket.emit('destroyPawns', deletedDocs);
      })
      .fail((r) => {
        toast.error('DBからコマを削除しようとしましたが、失敗しました。');
        console.error(r);
      })
    
  }
  
  /**
   * コマのDOM削除を行う。
   * @param criteria Object - boardId, id, dogTag
   */
  static removeFromDom(criteria) {
    let boardId = criteria.boardId;
    let id      = criteria.id;
    let dogTag  = criteria.dogTag;
    let index   = Pawn.instances.findIndex((p) => {
      return Pawn.get(criteria)[0] === p;
    });
    
    toast(`ボード:${boardId} から、コマ ${id} - ${dogTag} を削除。`);
    Pawn.get(criteria)[0].$dom.remove();
    Pawn.instances.splice(index, 1);
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
  
      this.$dom.css({transition: 'top 0.5s ease-in-out, left 0.5s ease-in-out'});
      this.$dom.css(key, value);
      setTimeout(() => {
        this.$dom.css({transition: 'none'})
      }, 1000);
    }
    let keysAttr = Object.keys(meta.attr);
    for (let i = 0; i < keysAttr.length; i++) {
      let key   = keysAttr[i].trim();
      let value = meta.style[key];
      if (key === '') {
        continue;
      }
      this.$dom.attr(key, value);
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
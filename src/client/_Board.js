"use strict";

const CU           = require('./commonUtil.js');
const toast        = require('./_toast.js');
const ImageManager = require('./_ImageManager');
const Mediator     = require('./_Mediator.js');
const Pawn         = require('./_Pawn.js');
const confirm      = require('./_confirm.js');

const mediator = new Mediator();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class Board {
  
  /**
   * コマを載せるボードオブジェクトに対応するクラス。
   *
   * @param id
   * @param name
   * @param key
   * @constructor
   */
  constructor(id, name, key) {
  
    if (typeof Board.instances === 'undefined') {
      Board.instances = [];
    }
  
    /*
     * idについてユニークなシングルトン
     */
    if (typeof Board.get({id: id}) === 'object') {
      return Board.get({id: id});
    }
  
    Board.instances.push(this);
    
    this.id         = id;
    this.active     = false;
    this.name       = name || '';
    this.characters = [];
    this.key        = key;
    
    /*
     * 作成後、デフォルトは200x200の灰色
     */
    this.$dom = $('<div></div>', {
        width   : '200px',
        height  : '200px',
        addClass: 'board',
        css     : {
          "background-color" : 'lightgray',
          "background-repeat": 'no-repeat',
          "position"         : 'absolute',
          "top"              : '0px',
          "left"             : '0px',
          "z-index"          : '0',
          "cursor"           : 'move',
          "font-size"        : '12px',
          "border-radius"    : '0.2em'
        },
      });
    
    /*
     * 非同期で画像割当
     */
    this.setImageSrc(key);
  
    this.$dom.attr({
        'data-board-id': id,
        'title'        : `board: ${this.name}`
      })
      .text(`[board] ${this.name}:${id}`);
  
    this.$dom.draggable({
      grid : [5, 5],
      start: () => {
        this.popUp();
      },
      stop : () => {
        this.select();
      },
    });
  
    this.$dom.on('click', () => {
      this.select()
    });
  
    this.$dom.on('contextmenu', (e) => {
        let menuProperties = {
          items   : [
            {key: 'destroy', name: 'ボードを削除'},
            {key: 'setImage', name: '画像を割り当て'}
          ],
          callback: contextMenuCallback.bind(this)
        };
        CU.contextMenu(e, menuProperties);
        e.stopPropagation();
    
      function contextMenuCallback(e, key) {
          switch (key) {
            case 'destroy':
              confirm('ボードの削除', `ボード『${this.name}』を削除しますか？`, 'removeBoardConfirm')
                .then(() => {
                  Board.removeFromDB({id: this.id});
                })
                .catch(() => {
                  // cancel
                });
              break;
            case 'setImage':
              /*
               * ボードを選択状態にし、画像設定
               */
              this.popUp();
              let im = new ImageManager((imageInfo) => {
                /*
                 * 画像管理ダイアログで割当ボタンを押下した際のコールバック
                 */
                this.attachImage(imageInfo.key)
                  .then((r) => {
                    /*
                     * DBへ登録成功後、ローカルのDOMの画像を差し替え、ソケットで通知
                     */
                    this.assignImage(imageInfo);
                    this.sendReloadRequest(imageInfo);
                  })
                  .catch((e) => {
                    console.error(e);
                  })
              });
              break;
            default:
              break;
          }
        }
      });
  
    /*
     * ボードの作成
     */
    mediator.emit('playGround.appendBoard', this);
    toast(`ボード: ${this.name}を作成しました！`);
    
    /*
     * ボードに紐づくコマを読み込んで表示する
     */
    let criteria = {boardId: this.id};
    this.loadPawn(criteria);
    
    /*
     * 画像の参照先変更リクエスト
     */
    socket.on('attachBoardImage', attachBoardImage.bind(this));
  
    mediator.on('board.deleteCharacter', deleteCharacter.bind(this));
    mediator.on('board.loadCharacter', loadCharacter.bind(this));
    mediator.on('board.appendPawn', appendPawn.bind(this));
  
    function attachBoardImage(payload) {
      if (payload.boardId !== this.id) {
        return false;
      }
      let imageInfo = payload.imageInfo;
      this.assignImage(imageInfo);
    }
  
    function deleteCharacter(criteria) {
      if (criteria.boardId !== this.id) {
        return false;
      }
      this.deleteCharacter(criteria);
    }
  
    function loadCharacter(boardId, characterId) {
      if (boardId !== this.id) {
        return false;
      }
      this.loadCharacter(characterId);
    
    }
  
    function appendPawn(instance) {
      if (instance.boardId !== this.id) {
        return false;
      }
      this.$dom.append(instance.$dom);
    }
  }
  
  die() {
    this.$dom.remove();
  }
  
  static get(criteria) {
    let id = criteria.id;
    
    let instance = Board.instances.find((board) => {
      return board.id === id;
    });
    return instance;
  }
  
  static getActiveInstance() {
    return Board.instances.find((board) => {
      return board.active === true;
    });
  }
  
  /**
   * DBからボードを削除し、削除リクエストを送信する
   * @param criteria
   */
  static removeFromDB(criteria) {
    let id    = criteria.id;
    let query = {scenarioId: sInfo.id, boardId: id};
    CU.callApiOnAjax(`/boards${CU.getQueryString(query)}`, 'delete')
      .done((r) => {
        
        let data = {scenarioId: sInfo.id, boardId: id};
        socket.emit('destroyBoards', data);
      })
      .catch((e) => {
        console.error('DBでのボード削除に失敗しました。');
        console.error(e);
      });
  }
  
  /**
   * DOMツリーから削除し、インスタンスストアからも削除する
   * @param criteria
   */
  static removeDom(criteria) {
    let id    = criteria.id;
    let index = Board.instances.findIndex((board) => {
      return board.id === id;
    });
    let board = Board.instances[index];
    
    board.die();
    $(`span[data-board-indicator-id="${id}"]`).remove();
    Board.instances.splice(index, 1);
  }
  
  popUp() {
    Board.popUp({id: this.id});
  }
  
  select() {
    Board.select({id: this.id});
  }
  
  /**
   * ボードを最前列へ表示する
   * @param criteria
   */
  static popUp(criteria) {
    let id = criteria.id;
    Board.instances.forEach(function(board) {
      if (board.id === id) {
        board.active = true;
        $(board.$dom).css('z-index', '10')
          .addClass('z-depth-5');
      } else {
        board.active = false;
        $(board.$dom).css('z-index', '0')
          .removeClass('z-depth-5');
      }
    });
  }
  
  /**
   * ボードに選択状態クラスを付与し、最前列へ表示する
   * @param criteria
   */
  static select(criteria) {
    let id = criteria.id;
    
    Board.popUp(criteria);
    
    Board.instances.forEach(function(board) {
      if (board.id === id) {
        $(board.$dom).addClass('board-front');
      } else {
        $(board.$dom).removeClass('board-front');
      }
    });
  }
  
  setImageSrc(key) {
    if (typeof key !== 'undefined') {
      
      let query = CU.getQueryString({key: key});
      
      CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
        .done((r) => {
          r.src = r.uri;
          this.assignImage(r)
        })
        .fail((r) => {
          console.error(r);
          return false;
        })
    }
  }
  
  /**
   * Domの画像の参照先を変更する
   *
   * @param imageInfo
   */
  assignImage(imageInfo) {
    
    let src    = imageInfo.src;
    let width  = imageInfo.width;
    let height = imageInfo.height;
    
    let meta = {
      "background-image" : (src) ? `url("${src}")` : 'none',
      "background-size"  : `${width}px ${height}px`,
      "background-repeat": 'no-repeat',
      "width"            : `${width}px`,
      "height"           : `${height}px`,
    };
    
    Object.keys(meta).forEach((v) => {
      this.$dom.css(`${v}`, `${meta[v]}`);
    });
  }
  
  /**
   * characterIdに対応するコマを参照し、新しく採番するdogTagを返却する。
   * コマを追加する際に使用する
   *
   * @param characterId
   * @returns {*}
   */
  getDogTag(characterId) {
    
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
  }
  
  /**
   * キャラクタの駒のDOMを作成する。
   *
   * @param _characterId
   * @param _dogTag
   * @param name
   * @param meta
   * @param key
   */
  deployCharacter(_characterId, _dogTag, name, meta, key) {
    let pawn = new Pawn(this.id, _characterId, _dogTag, name, meta, key);
    this.characters.push(pawn)
  }
  
  /**
   * シナリオとボードに紐づく駒を、新しくDBへ登録する。
   * ドッグタグはDB側で採番する。
   * 登録成功時は自分を含め、全員へ通知。
   *
   * @param characterId
   */
  registerCharacter(characterId) {
    let data = {
      scenarioId : sInfo.id,
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
          scenarioId : sInfo.id,
          pawnId     : r.pawnId,
          boardId    : r.boardId,
          characterId: r.characterId,
          dogTag     : r.dogTag,
        };
        toast(`DBへコマを新しく登録しました。`);
        socket.emit('deployPawns', payLoad);
      })
      .fail(function(r) {
      });
  }
  
  /**
   * DBから、シナリオとボードに紐づく駒の情報を取得する。
   * キャラクタIDを指定した場合、その条件で絞り込む。
   *
   * @param characterId
   */
  loadCharacter(characterId) {
    
    let dogTag  = this.getDogTag(characterId);
    let boardId = this.id;
    let data    = {
      scenarioId : sInfo.id,
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
  }
  
  /**
   * DBから対象のコマを削除する。
   * 削除成功時はdestroyPawns=コマのDOM削除リクエストを送信する。
   *
   * @param criteria
   */
  deleteCharacter(criteria) {
    Pawn.removeFromDB(criteria);
  }
  
  /**
   * deployPawnsからコールする。
   * コマをDBへ登録した通知を受け取った際のDOM作成処理。
   *
   * @param criteria
   */
  loadPawn(criteria) {
    let query = CU.getQueryString(criteria);
    CU.callApiOnAjax(`/pawns${query}`, 'get')
      .done((result) => {
        for (let i = 0; i < result.length; i++) {
          let r           = result[i];
          let boardId     = r.boardId;
          let characterId = r.characterId;
          let dogTag      = r.dogTag;
          let name        = '';
          let meta        = r.meta;
          let key         = r.key;
          this.deployCharacter(characterId, dogTag, name, meta, key);
        }
      })
      .fail(() => {
        toast.error('DBからコマ情報を取得する際にエラーが発生しました。');
      })
  }
  
  /**
   * ボードの移動メソッド
   */
  move(x, y) {
    this.$dom.css({'top': x ? x : 0});
    this.$dom.css({'left': y ? y : 0});
  }
  
  /**
   * 画像の割当を行うメソッド。
   * @param key
   */
  attachImage(key) {
    
    let payload = {
      scenarioId: sInfo.id,
      boardId   : this.id,
      key       : key
    };
    
    return CU.callApiOnAjax('/boards', 'patch', {data: payload})
  }
  
  /**
   * ボードの更新リクエスト
   */
  sendReloadRequest(imageInfo) {
    let payload = {
      scenarioId: sInfo.id,
      boardId   : this.id,
      imageInfo : imageInfo
    };
    socket.emit('attachBoardImage', payload);
  }
}

module.exports = Board;


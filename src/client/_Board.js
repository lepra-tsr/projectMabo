"use strict";

const CU           = require('./commonUtil.js');
const toast        = require('./_toast.js');
const ImageManager = require('./_ImageManager');
const Mediator     = require('./_Mediator.js');
const Pawn         = require('./_Pawn.js');

const mediator = new Mediator();

const scenarioId = CU.getScenarioId();
let socket       = undefined;

class Board {
  /**
   * コマを載せるボードオブジェクトに対応するクラス。
   *
   * @param _socket
   * @param id
   * @param name
   * @param key
   * @constructor
   */
  constructor(_socket, id, name, key) {
    this.id         = id;
    this.name       = name || '';
    this.characters = [];
    socket          = _socket;
    this.key        = key;
    
    /*
     * 作成後、デフォルトは200x200の灰色
     */
    this.dom =
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
          "font-size"        : '12px',
          "border-radius"    : '0.2em'
        },
      });
    
    /*
     * 非同期で画像割当
     */
    this.setImageSrc(key);
    
    $(this.dom)
      .attr({
        'data-board-id': id,
        'title'        : `board: ${this.name}`
      })
      .text(`[board] ${this.name}:${id}`)
      .draggable({
        grid : [5, 5],
        start: () => {
          mediator.emit('board.popUp', this.id);
        }
      })
      .on('click', () => {
        /*
         * クリックで選択可能にする
         */
        mediator.emit('board.clicked', this);
      })
      .on('contextmenu', (e) => {
        let menuProperties = {
          items   : [
            {key: 'destroy', name: 'ボードを削除'},
            {key: 'setImage', name: '画像を割り当て'}
          ],
          callback: contextMenuCallback.bind(this)
        };
  
        function contextMenuCallback(e, key) {
          switch (key) {
            case 'destroy':
              let confirm = window.confirm(`ボード『${this.name}』を削除しますか？`);
              if (confirm !== true) {
                return false;
              }
              mediator.emit('board.remove', this.id);
              break;
            case 'setImage':
              /*
               * ボードを選択状態にし、画像設定
               */
              mediator.emit('board.selectObject', this);
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
        CU.contextMenu(e, menuProperties);
        e.stopPropagation();
      });
  
    /*
     * ボードの作成を通知
     */
    mediator.emit('board.append', this);
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
      $(this.dom).append(instance.dom);
    }
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
      $(this.dom).css(`${v}`, `${meta[v]}`);
    });
  }
  
  /**
   * 属するコマオブジェクトから、characterIdとdogTagが一致する物を取得する
   *
   * @param characterId
   * @param dogTag
   * @returns {*}
   */
  getCharacterById(characterId, dogTag) {
    let character = this.characters.find(function(v) {
      return (v.id === characterId && v.dogTag === dogTag);
    });
    return character;
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
    let pawn = new Pawn(socket, this.id, _characterId, _dogTag, name, meta, key);
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
  }
  
  /**
   * ボード上の駒のDOMを削除する。指定方法はキャラクターIDとドッグタグ。
   * ドッグタグのみの指定はできない。
   * 指定しない場合、その条件については絞り込まず、該当する全ての駒を削除する。
   *
   * @param characterId
   * @param dogTag
   */
  destroyCharacter(characterId, dogTag) {
    toast(`ボード:${this.id} から、コマ ${characterId} - ${dogTag} を削除。`);
    /*
     * charactersへのポインタ
     */
    for (let i = 0; i < this.characters.length; i++) {
      let character = this.characters[i];
      if (character.id === characterId && character.dogTag === dogTag) {
        /*
         * DOMから削除し、ボードのキャラクタ配列からも削除する。
         */
        $(this.characters[i].dom).remove();
        this.characters.splice(i, 1);
      }
    }
  }
  
  /**
   * DBから対象のコマを削除する。
   * 削除成功時はdestroyPawns=コマのDOM削除リクエストを送信する。
   *
   * @param criteria
   */
  deleteCharacter(criteria) {
    let query = CU.getQueryString(criteria);
    CU.callApiOnAjax(`/pawns${query}`, 'delete')
      .done(function(deletedDocs) {
        /*
         * DOM削除リクエストの送信
         */
        toast('DBからコマ情報を削除しました。');
        if (deletedDocs.length === 0) {
          return false;
        }
        deletedDocs.forEach(function(d) {
          socket.emit('destroyPawns', d);
        })
      })
      .fail(function(r) {
        toast.error('DBからコマを削除しようとしましたが、失敗しました。');
        console.error(r);
      })
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
    this.dom.css({'top': x ? x : 0});
    this.dom.css({'left': y ? y : 0});
  }
  
  /**
   * 画像の割当を行うメソッド。
   * @param key
   */
  attachImage(key) {
    
    let payload = {
      scenarioId: scenarioId,
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
      scenarioId: scenarioId,
      boardId   : this.id,
      imageInfo : imageInfo
    };
    socket.emit('attachBoardImage', payload);
  }
}

module.exports = Board;


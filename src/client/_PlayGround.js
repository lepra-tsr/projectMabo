"use strict";

const CU       = require('./commonUtil.js');
const toast    = require('./_toast.js');
const Board    = require('./_Board.js');
const Pawn     = require('./_Pawn.js');
const Modal    = require('./_Modal.js');
const Mediator = require('./_Mediator.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;
const mediator     = new Mediator();

class PlayGround {
  /**
   * ボードを配置するオブジェクトに対応するクラス。
   *
   * @constructor
   */
  constructor() {
  
    if (typeof PlayGround.instance === 'object') {
      return PlayGround.instance;
    }
    PlayGround.instance = this;
    
    this.boards   = [];
    this.selected = undefined;
    
    /*
     * DOMの追加
     */
    this.$dom = $('<div></div>', {
      id : 'playGround',
      css: {
        "position"        : 'absolute',
        "top"             : '0px',
        "left"            : '0px',
        "width"           : '100%',
        "height"          : '100%',
        "background-color": '#eeeeee',
      }
    });
  
    $('body').append(this.$dom);
    
    /*
     * ボードの読み込み、表示
     */
    this.loadBoard();
    
    
    socket.on('deployBoards', (data) => {
      /*
       * 新規ボードをDBへ登録した後、他のユーザにそのボードを読み込み、DOMを作成させるリクエストを受信した際の処理
       */
      this.loadBoard();
    });
  
    /*
     * ボードをDOMから削除するリクエスト
     */
    socket.on('destroyBoards', (data) => {
      Board.removeDom({id: data.boardId});
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
      let pawns = data;
      if (!data instanceof Array) {
        pawns = [data];
      }
      pawns.forEach((p) => {
        Pawn.get({boardId: p.boardId, id: p.characterId, dogTag: p.dogTag})[0].die();
      })
    });
  
    mediator.on('playGround.popUp', (instance) => {
      this.selectPawn(instance);
    });
  
    mediator.on('playGround.appendBoard', (instance) => {
      this.$dom.append(instance.$dom);
      instance.select();
    });
  }
  
  /**
   * boardIdに紐づくボードオブジェクトを取得する
   *
   * @param boardId
   * @returns {*}
   */
  getBoardById(boardId) {
    return Board.get({id: boardId});
  }
  
  /**
   * 全てのボードの深度をマークアップする。
   * 最前面のボードと、それ以外のボードについてクラスを付与
   *
   * @param boardId
   * @returns {boolean}
   */
  popBoardUp(boardId) {
    Board.popUp({id: boardId});
  }
  
  /**
   * コマを強調表示し、乗っているボードを手前に表示する
   * それ以外の強調表示を解除する
   *
   * @param pawn {object}
   */
  selectPawn(pawn) {
    Board.select({id: pawn.boardId});
    pawn.select();
  }
  
  /**
   * ボードのDOMを作成する。
   *
   * @param boardId
   */
  loadBoard(boardId) {
    /*
     * 指定したボードをDBから取得し、playGround.boardsに反映する。
     * boardIdを指定しない場合は、このシナリオに紐付く全てのボードを対象に取る。
     */
    let getAll = (typeof boardId === 'undefined');
    let data   = {
      scenarioId: sInfo.id,
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
          let key     = b.key;
          new Board(boardId, b.name, key);
        });
      })
    
  }
  
  /**
   * ボードを新しく作成する。
   * Objectsコレクションの_idをユニークなボードIDに使用する。
   *
   * 新しいボードをObjectsコレクションに追加した後、
   * 他ユーザへボードIDを通知し、deployBoardsを送信する。
   *
   */
  createBoard(boardName) {
    
    if (!boardName || boardName === '') {
      toast.error('ボード名が無効です');
      return false;
    }
    
    let data = {
      scenarioId: sInfo.id,
      name      : boardName
    };
    
    /*
     * ボード追加時にAPIを叩いて新規ボード登録、登録成功後にIDを受け取ってsocketで通知する
     * 作成したボードのidをAPIから取得する
     */
    CU.callApiOnAjax('/boards', 'post', {data: data})
      .done((r) => {
        
        /*
         * 接続ユーザ全員にボードをリロードさせる
         */
        let data = {
          scenarioId: sInfo.id,
          boardId   : r.boardId,
        };
        socket.emit('deployBoards', data);
      })
      .fail((r) => {
        console.error(r); // @DELETEME
      });
  }
  
  /**
   * ボードをDBから削除する処理。
   * 削除成功時は、該当するボードのDOMの削除リクエストを通知する。
   *
   * (ボード上のコマはAPIが削除する)
   */
  removeBoard(boardId) {
    Board.removeFromDB({id: boardId})
  }
  
  /**
   * ナビメニューのアイコン、ボードのインスタンスとDOMを削除する。
   * (ボードのインスタンスの削除と同時に、コマのインスタンスも削除する)
   *
   * @param boardId
   */
  destroyBoard(boardId) {
    Board.removeDom({id: boardId});
  }
  
  /**
   * キャラクタ表からキャラクタを削除した際に呼び出す。キャラクタIDが等しいコマを全て削除する。
   * 全てのボードに対して実施し、ドッグタグは参照しない。
   *
   * @param characterId
   */
  removePawnByAllBoard(characterId) {
    this.boards.forEach((v) => {
      let criteria = {
        scenarioId : sInfo.id,
        boardId    : v.id,
        characterId: characterId
      };
      v.deleteCharacter(criteria);
    })
  }
}

module.exports = PlayGround;


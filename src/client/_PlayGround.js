"use strict";

const CU       = require('./commonUtil.js');
const toast    = require('./_toast.js');
const Board    = require('./_Board.js');
const Pawn     = require('./_Pawn.js');
const Modal    = require('./_Modal.js');
const Mediator = require('./_Mediator.js');

let socket       = undefined;
const scenarioId = CU.getScenarioId();
const mediator   = new Mediator();

class PlayGround {
  /**
   * ボードを配置するオブジェクトに対応するクラス。
   *
   * @param _socket
   * @constructor
   */
  constructor(_socket) {
    socket        = _socket;
    this.boards   = [];
    this.selected = undefined;
    
    /*
     * DOMの追加
     */
    this.dom = $('<div></div>', {
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
    
    $('body').append(this.dom);
    
    /*
     * ボード追加モーダルの初期化、イベント追加
     */
    let config = {
      id           : 'add-board',
      title        : 'ボードの作成',
      type         : 'modal',
      removeOnClose: false,
    };
    
    this.modalAddBoard = new Modal(config);
    
    let modalAddBoardButton = $('<a></a>', {
      addClass: 'waves-effect waves-teal btn-flat'
    }).text('作成する');
    
    let modalAddBoardInput = $('<input>', {
      addClass   : 'input-field',
      placeholder: 'ボード名を入力してください。'
    });
    
    this.modalAddBoard.addBoardButton = $(modalAddBoardButton);
    this.modalAddBoard.addBoardInput  = $(modalAddBoardInput);
    
    $(this.modalAddBoard.modalContent).append($(modalAddBoardButton));
    $(this.modalAddBoard.modalContent).append($(modalAddBoardInput));
    
    $(modalAddBoardButton)
      .on('click', () => {
        let boardName = $(modalAddBoardInput).val().trim();
        this.createBoard(boardName);
      });
    
    /*
     * ボードの読み込み、表示
     */
    this.loadBoard(scenarioId);
    
    
    socket.on('deployBoards', (data) => {
      /*
       * 新規ボードをDBへ登録した後、他のユーザにそのボードを読み込み、DOMを作成させるリクエストを受信した際の処理
       */
      this.loadBoard(scenarioId);
    });
    
    /*
     * ボードをDBから削除した際、他のユーザにそのボードをDOMから削除させるリクエストを受信した際の処理
     */
    socket.on('destroyBoards', (data) => {
      this.destroyBoard(data.boardId);
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
      let boardId = data.boardId;
      this.getBoardById(boardId).destroyCharacter(data.characterId, data.dogTag);
    });
  
    mediator.on('pawn.clicked', (instance) => {
      /*
       * コマの中から選択状態にし、紐付け先のボードを前面へ
       */
      this.selectObject(instance);
      this.popBoardUp(instance.boardId);
    });
  
    mediator.on('pawn.selectObject', (instance) => {
      this.selectObject(instance)
    });
  
    mediator.on('board.popUp', (boardId) => {
      this.popBoardUp(boardId);
    });
  
    mediator.on('board.clicked', (instance) => {
      /*
       * ボードを選択状態にし、前面へ
       */
      this.selectObject(instance);
      this.popBoardUp(instance.id);
    });
  
    mediator.on('board.remove', (boardId) => {
      this.removeBoard(boardId);
    });
  
    mediator.on('board.selectObject', (instance) => {
      this.selectObject(instance);
    });
  
    mediator.on('board.append', (instance) => {
      $(this.dom).append(instance.dom)
    });
  }
  
  /**
   * boardIdに紐づくボードオブジェクトを取得する
   *
   * @param boardId
   * @returns {*}
   */
  getBoardById(boardId) {
    return this.boards.find(function(v) {
      return v.id === boardId;
    })
  }
  
  /**
   * 最前面のボード(そのボードか、そのボードに紐づくコマをクリックした状態)を取得する
   * 取得に失敗した場合は-1を返却する
   *
   * @returns {*}
   */
  getActiveBoardId() {
    let activeBoard = $('.board.board-front');
    if ($(activeBoard).length === 0) {
      return -1;
    }
    return $(activeBoard).attr('data-board-id');
  }
  
  /**
   * 全てのボードの深度をマークアップする。
   * 最前面のボードと、それ以外のボードについてクラスを付与
   *
   * @param boardId
   * @returns {boolean}
   */
  popBoardUp(boardId) {
    if (this.boards.length === 0) {
      return false;
    }
    
    this.boards.forEach(function(v) {
      if (v.id === boardId) {
        $(v.dom).css('z-index', '10')
          .addClass('z-depth-5')
          .addClass('board-front');
      } else {
        $(v.dom).css('z-index', '0')
          .removeClass('z-depth-5')
          .removeClass('board-front');
      }
    });
  }
  
  /**
   * クリックで選択したオブジェクトをマークアップする
   *
   * ボードの場合は選択中のボードをマークアップする
   * コマの場合は紐づくボードも一緒にマークアップする
   *
   * それ以外のマークアップを解除する
   *
   * @param target
   */
  selectObject(target) {
    
    let key = undefined;
    
    if (target instanceof Board) {
      key = 'board';
    }
    if (target instanceof Pawn) {
      key = 'pawn';
    }
    if (typeof key === 'undefined') {
      return false;
    }
    
    this.selected = [];
    
    switch (key) {
      case 'board':
        /*
         * ボードを選択し、他のボードと全てのコマの選択を解除
         */
        let boardId = target.id;
        
        this.boards.forEach((b) => {
          if (b.id === boardId) {
            this.selected.push(b);
          }
        });
        
        break;
      
      case 'pawn':
        /*
         * コマを選択し、他のコマと全てのボードの選択を解除
         */
        let characterId = target.id;
        this.boards.forEach((b) => {
          b.characters.forEach((c) => {
            if (c.id === characterId) {
              this.selected.push(c)
            }
          });
        });
        
        break;
      
      default:
        return false;
    }
  }
  
  /**
   * ボードのDOMを作成する。
   *
   * @param scenarioId
   * @param boardId
   */
  loadBoard(scenarioId, boardId) {
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
        r.forEach((b) => {
          let boardId       = b._id;
          let key           = b.key;
          let alreadyExists = this.boards.some((b) => {
            return b.id === boardId
          });
  
          if (!alreadyExists) {
            let board = new Board(socket, boardId, b.name, key);
            this.boards.push(board);
            this.popBoardUp(boardId);
          }
          
        });
      })
    
  }
  
  /**
   * ボード作成用モーダルを開く
   */
  openModalDeployBoard() {
    
    $(this.modalAddBoard.addBoardInput).val('');
    this.modalAddBoard.show();
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
      scenarioId: scenarioId,
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
          scenarioId: scenarioId,
          boardId   : r.boardId,
        };
        socket.emit('deployBoards', data);
        this.modalAddBoard.hide();
      })
      .fail((r) => {
      
      });
  }
  
  /**
   * ボードをDBから削除する処理。
   * 削除成功時は、該当するボードのDOMの削除リクエストを通知する。
   *
   * (ボード上のコマはAPIが削除する)
   */
  removeBoard(boardId) {
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
  }
  
  /**
   * ナビメニューのアイコン、ボードのインスタンスとDOMを削除する。
   * (ボードのインスタンスの削除と同時に、コマのインスタンスも削除する)
   *
   * @param boardId
   */
  destroyBoard(boardId) {
    let targetIndex = this.boards.findIndex(function(v) {
      return v.id === boardId;
    });
    if (targetIndex !== -1) {
      $(this.boards[targetIndex].dom).remove();
      $(`span[data-board-indicator-id=${boardId}]`).remove();
      this.boards.splice(targetIndex, 1);
    }
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
        scenarioId : scenarioId,
        boardId    : v.id,
        characterId: characterId
      };
      v.deleteCharacter(criteria);
    })
  }
}

module.exports = PlayGround;


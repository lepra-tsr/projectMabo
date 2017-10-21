"use strict";

const CU    = require('./commonUtil.js');
const toast = require('./_toast.js');


let socket         = undefined;
const scenarioId   = CU.getScenarioId();

/*
 * 画像の高さ、画像位置の間隔(px)
 */
const IMAGE_HEIGHT      = 200;
const AVATAR_IMAGE_SPAN = 60;

/*
 * 立ち絵画像を再表示するまでの時間(mS)
 */
const AVATAR_IMAGE_RE_RAISE = 800;

let PeeKaBoo = function() {
  this.delay    = AVATAR_IMAGE_RE_RAISE;
  this.interval = [];
};

PeeKaBoo.prototype.boo = function(callback) {
  
  if (typeof callback !== 'function') {
    return false;
  }
  
  /*
   * 前のカウントを削除してカウント開始
   */
  clearInterval(this.interval);
  let id        = setTimeout(callback, this.delay);
  this.interval = id;
};

class Avatar {
  
  constructor(_socket) {
    socket   = _socket;
    let body = $('body');
  
    this.config = [];
    
    this.dom = $('<div></div>', {
      css: {
        position : 'absolute',
        top      : '50%',
        left     : '10%',
        'z-index': 500,
      }
    });
  
    this.dragHandle = $('<div></div>', {
      addClass: 'drag-handle',
      css     : {
        position          : 'absolute',
        'line-height'     : '0.8em',
        bottom            : '-25px',
        cursor            : 'move',
        'background-color': 'white',
        'border-radius'   : '0.2em'
      }
    });
  
    let handle = $('<i></i>').addClass('material-icons').text('drag_handle');
    $(this.dragHandle).append($(handle));
  
    this.avatars = $('<div></div>', {});
  
    $(this.dom).draggable({
      handle: 'div.drag-handle',
      grid  : [1, 1],
    });
  
    $(this.dom).append($(this.dragHandle));
    $(this.dom).append($(this.avatars));
    $(body).append($(this.dom));
    
    this.fetch()
      .then(() => {
        this.update();
      })
      .catch(() => {
        toast.error('アバター設定読み込みエラー')
      });
  
    socket.on('reloadAvatars', (data) => {
      /*
       * 自分が発信したものについては無視
       */
      if (data.from === socket.id) {
        return false;
      }
      this.fetch()
        .then(() => {
          this.update();
          toast.info('アバター設定を更新します');
        })
        .catch(() => {
          toast.error('アバター設定更新エラー');
        })
    })
  
  }
  
  /**
   * アバター設定をAPIから取得する
   *
   * @return Promise
   */
  fetch() {
    let query = CU.getQueryString({scenarioId: scenarioId});
    return CU.callApiOnAjax(`/avatars${query}`, 'get')
      .then((r) => {
        this.config = [].concat(r.filter((a) => {
          return a.disp
        }));
      })
      .fail((e) => {
        console.info(e);
      })
  }
  
  /**
   * 現在ローカルにストアしているアバター設定で立ち絵を描画する
   */
  update() {
    /*
     * 表示位置の初期化
     */
    $(this.avatars).empty();
    
    /*
     * 表示位置順に並び替え
     */
    this.config.sort((x, y) => {
      return (x.position > y.position) ? 1 : -1
    });
    this.config.forEach((c) => {
  
      if (!c.hasOwnProperty('imageKey') || typeof c.imageKey === 'undefined') {
        /*
         * 画像が未割り当てのAvatarに関してはスキップ
         */
        return true;
      }
      
      let image = new Image();
      let query = CU.getQueryString({key: c.imageKey});
      CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
        .then((r) => {
          image.src = r.uri;
        })
        .catch((e) => {
          toast.error('画像URL読み込みエラー');
          console.error(e);
        });
      
      image.onload = () => {
        let h = image.height;
        if (h > IMAGE_HEIGHT) {
          image.height = IMAGE_HEIGHT;
        }
        $(image).css({
          position: 'absolute',
          bottom  : '0px',
          opacity : '0.7',
          left    : `${c.position * AVATAR_IMAGE_SPAN}px`,
          width   : 'auto',
        });
        
        /*
         * マウスオンで隠れるようにする
         */
        let pee  = new PeeKaBoo();
        let body = $('body');
        
        $(image).on('mousemove.avatar', () => {
          $(image).addClass('d-none');
          
          /*
           * avatar画像上のmoveで非表示にしている間は、bodyにmoveのリスナを付与
           */
          $(body).on('mousemove.avatar', () => {
            boo.call(this);
          });
          boo.call(this);
        });
        
        $(this.avatars).append($(image));
        
        function boo() {
          pee.boo((() => {
            $(image).removeClass('d-none')
            $(body).off('mousemove.avatar');
          }));
        }
      }
    });
  }
}

module.exports = Avatar;


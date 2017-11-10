"use strict";

const CU           = require('./commonUtil.js');
const Modal        = require('./_Modal.js');
const ImageManager = require('./_ImageManager.js');
const toast        = require('./_toast.js');
const Mediator     = require('./_Mediator.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class AvatarManager {
  /**
   * 立ち絵管理ダイアログ
   *
   * @param _socket
   * @constructor
   */
  constructor() {
    this.$modalContent = undefined;
    this.$modalFooter  = undefined;
    this.$modal        = undefined;
    
    let config = {
      id           : 'avatar-manager',
      type         : 'fixed-footer',
      title        : '設定',
      dismissible  : false,
      removeOnClose: true
    };
    
    /*
     * モーダル構築
     */
    Modal.call(this, config);
    
    /*
     * 設定テーブル表示領域
     */
    this.$grid = $(`<div></div>`, {name: 'avatar-config-table'});
    this.$modalContent.append(this.$grid);
    
    /*
     * 追加ボタン、更新ボタン
     */
    let $buttonDiv = $('<div></div>');
  
    let $cancelButton = $('<a></a>', {
      addClass: 'btn btn-flat waves-effect waves-light',
      name    : 'cancel',
      type    : 'button',
    }).text('キャンセル');
    let $addButton    = $('<a>', {
      addClass: 'btn btn-flat waves-effect waves-light',
      name : 'addAvatar',
      type : 'button',
    }).text('追加');
    let $pushButton   = $('<a>', {
      addClass: 'btn btn-flat waves-effect waves-light',
      name : 'pushAvatar',
      type : 'button',
    }).text('更新');
    $buttonDiv.append($cancelButton);
    $buttonDiv.append($addButton);
    $buttonDiv.append($pushButton);
    this.$modalFooter.append($buttonDiv);
    
    /*
     * キャンセル
     */
    $cancelButton.on('click', () => {
      this.hide()
    });
    
    /*
     * 行追加ボタン
     */
    $addButton.on('click', () => {
      let data = {
        _id     : '',
        disp    : true,
        speaker   : '名前',
        state   : '普通',
        position: 0,
        effect  : 'none',
      };
      this.data.push(data);
      let newTr = this.makeRow.call(this, data);
      $(newTr).find('[name="avatar-speaker-input"]').trigger('click');
      toast('行を追加');
    });
    
    /*
     * 更新ボタン
     */
    $pushButton.on('click', () => {
      this.pushData()
        .then(() => {
          this.renderGrid();
          toast.success('立ち絵設定の登録に成功');
        })
        .catch();
    });
    
    /*
     * ヘッダ
     */
    const HEADER = [
      '表示',
      '名前',
      '状態',
      '表示位置',
      '効果',
    ];
    this.header  = HEADER;
    
    /*
     * 表示内容の配列
     */
    this.data = [];
    
    /*
     * DBから設定データを取得完了後にモーダルを表示
     */
    this.fetchData()
      .then(() => {
        this.renderGrid();
        this.show();
      });
  }
  
  /**
   * Avatarの登録状況をテーブル形式で表示する
   */
  renderGrid() {
    
    /*
     * 初期化
     */
    this.$grid.empty();
    
    this.table = $('<table></table>', {addClass: 'centered bordered'});
    this.thead = $('<thead></thead>');
    let header =
          `<tr>` +
          `<th>表示</th>` +
          `<th>名前</th>` +
          `<th>状態</th>` +
          `<th>表示位置</th>` +
          `<th>エフェクト</th>` +
          `<th>サムネイル</th>` +
          `<th>削除予定</th>` +
          `</tr>`;
    $(this.thead).append($(header));
    this.tbody = $('<tbody></tbody>');
    
    /*
     * 行作成
     */
    this.data.forEach((v) => {
      this.makeRow.call(this, v);
    });
    
    /*
     * テーブルDOM組み立て
     */
    $(this.table).append($(this.thead));
    $(this.table).append($(this.tbody));
    this.$grid.append($(this.table));
    
  }
  
  /**
   * 行作成メソッド
   */
  makeRow(data) {
  
    let $tr           = $('<tr></tr>');
    let $disp         = $('<td></td>');
    let $speaker      = $('<td></td>');
    let $state        = $('<td></td>');
    let $position     = $('<td></td>');
    let $effect       = $('<td></td>');
    let $imageKey     = $('<td></td>');
    let $deleteAvatar = $('<td></td>');
    
    let _id      = data._id;
    let disp     = data.disp;
    let speaker    = data.speaker;
    let state    = data.state;
    let position = data.position;
    let effect   = data.effect;
    
    /*
     * disp: 表示可否
     */
    let $dispInput = $('<input />', {id: `avatar-${_id}`, type: 'checkbox'});
    let $dispLabel = $('<label></label>', {for: `avatar-${_id}`});
    if (disp === true) {
      $dispInput.attr('checked', true);
    }
    $dispInput.on('click', () => {
      data.disp = $dispInput.prop('checked');
      
    });
    $disp.append($dispInput);
    $disp.append($dispLabel);
    
    /*
     * 対象発言者。spanとinputを重ねて表示し、入力時はinputを表示する。
     */
    let $speakerSpan = $('<span></span>', {name: 'avatar-speaker-input', css: {cursor: 'pointer',}}).text(speaker);
    
    /*
     * クリックでinputを表示して編集モード
     */
    $speakerSpan.on('click', () => {
      $speakerSpan.addClass('d-none');
      let $speakerInput = $('<input>', {addClass: 'browser-default', name: `avatar-speaker-input-${_id}`});
      $speakerInput.val(speaker);
      $speaker.append($speakerInput);
      
      /*
       * 追加時にフォーカスする
       */
      $speakerInput.focus();
      
      /*
       * フォーカスが外れるかreturnで確定
       */
      $speakerInput.on('blur', () => {
        fix.call(this);
      });
      $speakerInput.on('keypress', (e) => {
        if (e.keyCode === 13 || e.key === 'enter') {
          fix.call(this);
        }
      });
      
      /**
       * 確定メソッド
       */
      function fix() {
        let targetSpeaker = $speakerInput.val().trim();
        if (targetSpeaker.length !== 0) {
          data.speaker = targetSpeaker;
        }
        $speakerInput.remove();
        $speakerSpan.text(targetSpeaker);
        $speakerSpan.removeClass('d-none');
      }
    });
    $speaker.append($speakerSpan);
    
    /*
     * 状態
     */
    $state.text(state);
    
    /*
     * 位置
     */
    $position.text(position);
    
    /*
     * エフェクト
     */
    $effect.text(effect);
    
    /*
     * 削除フラグボタン
     */
    let $deleteButton = $('<a></a>', {
      addClass: 'waves-effect waves-red btn-flat red-text'
    }).html('<i class="material-icons">delete</i>');
    $deleteAvatar.append($deleteButton);
    $deleteButton.on('click', (e) => {
      for (let i = 0; i < this.data.length; i++) {
        let d = this.data[i];
        if (d === data) {
          let deleted = this.data.splice(i, 1);
          $deleteButton.addClass('red white-text');
          $deleteButton.removeClass('red-text');
          $tr.addClass('blue-grey lighten-5');
          
          break;
        }
      }
      toast('削除予定に変更');
    });
    
    /*
     * 画像設定
     *
     * 初期状態は "Loding..." 表示
     */
    $imageKey.text('loading...');
    
    /*
     * 画像データ格納用の仮想DOM作成
     */
    let image = new Image();
    
    /*
     * 画像設定ボタン
     */
    let $imageKeyButton = $('<a></a>', {
      addClass: 'waves-effect waves-teal btn-flat teal-text'
    }).text('画像選択');
    
    /*
     * 画像割り当て済みの場合は画像を取得、割当が行われていない場合は登録ボタンを表示
     */
    if (data.hasOwnProperty('imageKey') && typeof data.imageKey !== 'undefined' && data.imageKey.trim() !== '') {
      
      let query = CU.getQueryString({key: data.imageKey || ''});
      
      /*
       * 画像表示用の一時URIを取得
       */
      CU.callApiOnAjax(`/images/signedURI/getObject${query}`, 'get')
        .then((r) => {
          /*
           * 画像読み込み開始
           */
          image.src = r.uri;
        })
        .catch((e) => {
          /*
           * 無効な画像キーの場合
           */
          $imageKey.text('');
          $imageKeyButton.on('click', attachImageManagerEvent.bind(this));
          $imageKey.append($imageKeyButton);
          console.warn('画像キーが無効です');
        });
      
    } else {
      /*
       * 画像未登録の場合
       */
      $imageKey.text('');
      $imageKeyButton.on('click', attachImageManagerEvent.bind(this));
      $imageKey.append($imageKeyButton);
    }
    
    
    /*
     * 画像読み込みが終わったらCanvasで表示、そのDOMに画像割当イベントリスナを付与
     */
    image.onload = () => {
      $imageKey.text('');
      
      let canvas = document.createElement('CANVAS');
      
      $(canvas).attr('id', `canvas-${_id}`);
      $(canvas).css(
        {
          height: '50px',
          width : '150px'
        }
      );
  
      $imageKey.append($(canvas));
      
      $(canvas).on('click', attachImageManagerEvent.bind(this));
      
      let ctx = canvas.getContext('2d');
      let rw  = image.width;
      let rh  = image.height;
      let dw  = 150;
      let dh  = 50;
      let mag = calcMagnify.call(this);
      
      ctx.drawImage(image, 0, 0, rw * mag, rh * mag);
      
      function calcMagnify() {
        let mag;
        
        if (rw < dw && rh >= dh) {
          /*
           * 幅または高さのどちらかが足りない場合
           */
          mag = dw / rw;
        } else if (rh < dh && rw >= dw) {
          mag = dh / rh;
        } else if (rw < dw && rh < dh) {
          /*
           * 幅も高さも足りない場合は短辺を合わせる
           */
          mag = ((mw, mh) => {
            return mw < mh ? mw : mh
          })(dw / rw, dh / rh);
        } else {
          /*
           * 十分な場合は長辺を合わせる
           */
          mag = ((mw, mh) => {
            return mw < mh ? mh : mw;
          })(dw / rw, dh / rh)
        }
        return mag
      }
      
    };
    
    /*
     * DOM組み立て
     */
    $tr.append($disp);
    $tr.append($speaker);
    $tr.append($state);
    $tr.append($position);
    $tr.append($effect);
    $tr.append($imageKey);
    $tr.append($deleteAvatar);
  
    $(this.tbody).append($tr);
  
    return $tr;
    
    /**
     * 対象のDOMに、画像管理ダイアログで実行するコールバック関数
     * this.dataを更新して立ち絵設定を再読込する
     */
    function attachImageManagerEvent() {
      let im = new ImageManager((imageInfo) => {
        /*
         * 画像管理ダイアログで割当ボタンを押した際のコールバック
         */
        data.imageKey = imageInfo.key;
        this.renderGrid();
      });
    }
  }
  
  /**
   * APIから登録済みのAvatar設定をロードし、プロパティへ格納
   *
   * @return Promise
   */
  fetchData() {
    
    let query = CU.getQueryString({scenarioId: sInfo.id});
    
    return CU.callApiOnAjax(`/avatars${query}`, 'get')
      .done((r) => {
        this.data = [].concat(r);
      })
      .fail((e) => {
        console.info(e);
      })
  }
  
  /**
   * Avatar設定登録APIへ、現在の設定内容を登録する
   *
   * @return Promise
   */
  pushData() {
    let data = {
      scenarioId: sInfo.id,
      config    : this.data
    };
    
    return CU.callApiOnAjax('/avatars', 'put', {data: data})
      .done((r) => {
        socket.emit('reloadAvatars', {from: socket.id, scenarioId: sInfo.id})
      });
  }
}

Object.assign(AvatarManager.prototype, Modal.prototype);

module.exports = AvatarManager;
"use strict";

const CU                 = require('./commonUtil.js');
const command            = require('./_command.js');
const ChannelSelectorOut = require('./_ChannelSelectorOut.js');
const Mediator           = require('./_Mediator.js');
const toast              = require('./_toast.js');
const Dialog             = require('./_Dialog');
const scenarioId         = CU.getScenarioId();

let socket = undefined;

class TextForm {
  /**
   * チャット入力フォームクラス
   * @param _socket
   * @constructor
   */
  constructor(_socket) {
    
    this.dom = undefined;
    
    /*
     * Dialog基底クラスのコンストラクタ
     */
    Dialog.call(this);
  
    socket          = _socket;
    this.socketId   = socket.id;
    this.scenarioId = '';
    this.text       = '';
    this.count      = 0;
    this.postscript = [];
    this.onType     = [];
    this.alias      = 'noname';
    this.status     = 'blank';
  
    this.avatarConfig = [];
    
    /*
     * 発言先セレクタ
     */
    this.channelSelector = new ChannelSelectorOut(socket);
    
    /*
     * 本体div
     */
    $(this.dom).css({
      "margin"        : '0px',
      "padding-top"   : '12px',
      "padding-bottom": '12px',
      "overflow"      : 'visible',
    });
    
    /*
     * エイリアスと状態
     */
    this.aliasStateDom = $('<div></div>', {});
  
    this.aliasEditButtonDom = $('<a></a>', {
      addClass: 'btn-flat waves-effect waves-teal teal-text',
    });
    $(this.aliasEditButtonDom).html('<i class="material-icons">create</i>');
  
    this.aliasSelectDom = $(`<select></select>`, {
      addClass: 'browser-default',
      name    : 'alias-select',
      css     : {
        "font-size": '1.5em',
        width      : 'auto',
        display    : 'inline-block',
        border     : '0px',
        "margin"   : '0px',
        "cursor"   : 'pointer',
      }
    });
  
    /*
     * 発言者変更フォーム
     */
    this.aliasInputDom = $(`<input>`, {
      addClass: 'alias d-none',
      type    : 'form',
      css     : {
        'display'  : 'inline-block',
        "font-size": '2em',
        "margin"   : '0 0 0 0',
      }
    });
    $(this.aliasStateDom).append($(this.aliasEditButtonDom));
    $(this.aliasStateDom).append($(this.aliasSelectDom));
    $(this.aliasStateDom).append($(this.aliasInputDom));
    
    
    /*
     * 発言入力用テキストエリア
     */
    this.textAreaDom = $(`<textarea></textarea>`, {
      "data-length": "200",
      css          : {
        "resize" : 'none',
        "width"  : '100%',
        "padding": '0px',
        "margin" : '0px',
      }
    });
    
    /*
     * 入力中表示
     */
    this.onTypeDom = $(`<span></span>`, {css: {"font-size": '0.8em'}});
  
    /*
     * 発言先指定セレクトボックス
     */
    this.channelSelectDom = this.channelSelector.dom;
    
    /*
     * DOM組み立て
     */
    $(this.dom).append($(this.aliasStateDom));
    $(this.dom).append($(this.channelSelectDom));
    $(this.dom).append($(this.textAreaDom));
    $(this.dom).append($(this.onTypeDom));
    
    /*
     * イベント付与
     */
  
    /*
     * 他ユーザのタイピング状況
     */
    socket.on('onType', this.receiveOnType.bind(this));
  
    /*
     * 他ユーザのログアウト通知でタイピング状況をリセット
     */
    socket.on('logOut', this.receiveLogOut.bind(this));

    /*
     * アバター設定の変更を取り込む
     */
    socket.on('reloadAvatars', this.reloadAvatar.bind(this));
  
    /*
     * エイリアスを非表示、テキストフォームを重ねて表示し全選択
     */
    $(this.aliasEditButtonDom).on('click', (e) => {
      toggleEditMode.call(this, true, e);
    });
  
    /*
     * セレクトボックスを切り替えた際の通知
     */
    $(this.aliasSelectDom).on('change', () => {
      let alias = $(this.aliasSelectDom).find('option:selected').text();
      toast(`エイリアスを${alias}へ変更`);
    });
    
    /*
     * フォームからフォーカスが外れたら、その値でエイリアスを更新
     */
    $(this.aliasInputDom)
      .on('blur', (e) => {
        toggleEditMode.call(this, false, e);
      })
      .on('keypress', (e) => {
        if (e.keyCode === 13 || e.key === 'Enter') {
          toggleEditMode.call(this, false, e);
        }
      });
  
    /**
     * チャットフォームのエイリアス名編集ボタンを押した時・編集確定時
     *
     * @param edit
     * @param e
     */
    function toggleEditMode(edit, e) {
      if (edit === false) {
        /*
         * 編集確定
         */
        this.addTempAlias($(e.target).val());
        $(this.aliasSelectDom).removeClass('d-none');
        $(this.aliasInputDom).addClass('d-none');
      } else if (edit === true) {
        /*
         * 編集開始
         */
        this.alias = $(this.aliasSelectDom).find('option:selected').text();
        $(this.aliasSelectDom).addClass('d-none');
        $(this.aliasInputDom).val(this.alias).removeClass('d-none');
        this.aliasInputDom.focus().select();
      }
    }
    
    /*
     * フキダシ更新
     */
    $(this.textAreaDom)
      .on('change', () => {
        this.sendOnType();
      })
      .on('keyup', () => {
        this.sendOnType();
      })
      .on('keypress', (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
          this.ret();
          return false;
        }
        this.sendOnType();
      })
      .on('blur', () => {
        this.sendOnType();
      });
    
    this.dialog({
      title   : 'Chat',
      width   : '310px',
      position: {at: 'right bottom'}
    });
  
    /*
     * アバター設定をDBからロードする
     */
    this.reloadAvatar();
  }
  
  reloadAvatar() {
    this.fetchAvatarConfig()
      .then((r) => {
        /*
         * セレクトボックスの内容をアバターの設定を使用して更新
         */
        this.updateState();
      })
      .catch((r) => {
        console.error(r);
      })
  }
  
  /**
   * エイリアス名の文字列をパースして一時的な設定を取得する
   */
  parseAliasInput(_tempOption) {
    let tempOption = _tempOption;
    let parsedStr  = _tempOption.label.split('##');
    
    tempOption.state  = tempOption.state || parsedStr[1] || 'none';
    tempOption.alias  = tempOption.alias || parsedStr[0] || _tempOption.label || 'noname';
    tempOption.active = true;
    
    return tempOption;
  }
  
  /**
   * アバター設定へ追加して選択フラグを立てる
   *
   * @param _tempOption
   */
  pushTempOptions(_tempOption) {
    
    let tempOption = this.parseAliasInput(_tempOption);
    
    for (let i = 0; i < this.avatarConfig.length; i++) {
      let o    = this.avatarConfig[i];
      o.active = false;
    }
    
    this.avatarConfig.push(tempOption);
  }
  
  get container() {
    return {
      socketId  : this.socketId,
      scenarioId: this.scenarioId,
      alias     : this.alias,
      state     : this.state,
      text      : this.text,
      channel   : this.channelSelector.getSelectedName(),
      status    : this.status,
      count     : this.count,
      postscript: this.postscript
    }
  }
  
  /**
   * エイリアス変更時にコールするメソッド
   */
  addTempAlias(_newAlias) {
    /*
     * エイリアス変更処理。有効なエイリアスでない場合は、フォームの値を以前のエイリアスへ戻す。
     * エイリアスの変更を通知する。
     */
    let newRawAlias = _newAlias.trim();
    let newAlias    = CU.htmlEscape(newRawAlias);
    let oldAlias    = this.alias;
    
    /*
     * 空文字はNG、maboもシステム用なのでNG
     */
    if (newRawAlias === '' || newRawAlias === 'mabo') {
      return false;
    }
    
    if (newRawAlias !== oldAlias) {
      toast(`エイリアスを${newAlias}へ変更`);
      this.alias = newRawAlias;
      
      this.pushTempOptions({label: newAlias});
      this.updateState();
      
      /*
       * ログイン時(空文字→socket.id)は通知しない
       */
      socket.emit('changeAlias', {alias: oldAlias, newAlias: newAlias, scenarioId: scenarioId});
      return false;
    }
  }
  
  /**
   * アバター設定セレクトボックスを再生成する
   */
  updateState() {
  
    uniqueAvatarConfig.call(this);

    $(this.aliasSelectDom).empty();
  
    this.avatarConfig.forEach((ac) => {
      let o = $('<option></option>', {
        value       : ac.value,
        'data-alias': ac.alias,
        'data-state': ac.state,
      }).text(ac.label || `${ac.alias}##${ac.state}`);
      if (ac.hasOwnProperty('active') && ac.active === true) {
        o.prop('selected', true);
      }
      $(this.aliasSelectDom).append($(o));
      
    });
  
    /**
     * アバター設定のoptionを作成する前にユニークにする
     */
    function uniqueAvatarConfig() {
    
      let result = [];
          let active = this.avatarConfig.find((a) => {
        return a.hasOwnProperty('active') && a.active === true
      });
    
      for (let i = 0; i < this.avatarConfig.length; i++) {
        let a = this.avatarConfig[i];
        let duplicated = false;
      
        for (let j = 0; j < this.avatarConfig.length; j++) {
          let needle = this.avatarConfig[j];
  
          if (i === j) {
            break;
          }
          
          duplicated = a.alias === needle.alias && a.state === needle.state;
          
          if (duplicated) {
            break;
          }
        }
      
        if (duplicated) {
          continue;
        }
      
        result.push(a);
      }
    
      /*
       * 選択状態を初期化
       */
      if (typeof active !== 'undefined') {
        result.forEach((r) => {
          r.active = (active.alias === r.alias && active.state === r.state);
        })
      }
    
      this.avatarConfig = result;
    }
  }
  
  /**
   * DBからアバター設定を取得、ローカルのそれと連結する
   */
  fetchAvatarConfig() {
    let query = CU.getQueryString({scenarioId: scenarioId});
    
    return CU.callApiOnAjax(`/avatars${query}`, 'get')
      .done((r) => {
        this.avatarConfig = this.avatarConfig.concat(r);
        if (this.avatarConfig.length === 0) {
          this.pushTempOptions({label: this.alias});
        }
      })
      .fail((e) => {
        console.info(e);
      });
  }
  
  /**
   * DOMから情報取得
   */
  getFormData() {
    this.socketId   = socket.id;
    this.scenarioId = scenarioId;
    this.alias      = CU.htmlEscape($(this.aliasSelectDom).find('option:selected').attr('data-alias')) || 'noname';
    this.state      = CU.htmlEscape($(this.aliasSelectDom).find('option:selected').attr('data-state')) || 'none';
    this.text       = $(this.textAreaDom).val();
    this.postscript = [];
  }
  
  ret() {
    this.getFormData();
    
    if (command.isSpell === true) {
      this.execCommand();
    } else {
      this.chat();
    }
    
    // チャットメッセージを空にして吹き出しを送信(吹き出しクリア)
    $(this.textAreaDom).val('');
    this.sendOnType();
    
  }
  
  execCommand() {
    // command.exec();
  }
  
  chat() {
    let text = this.text;
    
    // 空文字のチャットは送信しない(スペースのみはOK)
    if (text === '') {
      return false;
    }
    
    // 置換文字列を解決して、データコンテナにpostScript要素を作成
    this.postscript = execPlaceholder(text);
    
    // HTMLエスケープ
    let _escaped = CU.htmlEscape(text);
    
    this.text = _escaped;
    
    // 送信
    socket.emit('chatMessage', this.container);
    return false;
  }
  
  sendOnType(force, text) {
    // チャットUIの入力値を取り込み
    this.getFormData();
    
    this.text = (typeof text === 'undefined')
      ? this.text
      : text;
    
    let rawText = this.text;
    command.parse(rawText.trim());
    
    let countBefore = this.count;
    
    if (command.isSpell === true) {
      /*
       * スラッシュコマンドの場合は送信しない
       */
      this.count = 0;
    } else {
      this.count = rawText.trim().length;
    }
    
    let beforeStatus = this.status;
    let gradient     = this.count - countBefore;
    
    if (countBefore === 0 && this.count > 0) {
      /*
       * 書き出し (start)
       */
      this.status = 'start';
    } else if (gradient > 0 && this.count !== 0) {
      /*
       * 書き足し (add)
       */
      this.status = 'add';
    } else if (gradient < 0 && this.count !== 0) {
      /*
       * 書き足し (delete)
       */
      this.status = 'delete';
    } else if (gradient !== 0 && this.count === 0) {
      /*
       * 削除/送信 (blank)
       */
      this.status = 'blank';
    } else if (gradient === 0) {
      /*
       * 文字数が変化しない場合は無視
       */
      // console.warn(`ignore onType - count: ${countBefore} → ${this.count}`);
      return false;
    }
    
    /*
     * statusが変化しなかった場合は無視
     */
    if (beforeStatus === this.status) {
      // console.warn(`ignore continuous - ${this.status}`);
      return false;
    }
    
    let type = {
      socketId  : this.socketId,
      scenarioId: this.scenarioId,
      alias     : this.alias,
      status    : this.status
    };
    
    socket.emit('onType', type);
  }
  
  /**
   * onTypeのソケットを受信した時の処理
   * onTypeDomに、入力中のエイリアス名を表示する
   */
  receiveOnType(container) {
    /*
     * onTypeの配列にupsertする
     * 先頭に追加してuniqueに
     */
    let item = {
      socketId: container.socketId,
      alias   : container.alias,
      status  : container.status,
    };
    
    this.onType = this.onType.filter((v) => {
      return v.socketId !== item.socketId;
    });
    this.onType.push(item);
    
    let aliasArray = this.onType
      .filter((v) => {
        return (v.status !== 'blank' && v.socketId !== socket.id)
      })
      .map((v) => {
        return v.alias;
      });
    
    if (aliasArray.length === 0) {
      $(this.onTypeDom).text('');
    } else {
      let aliasCsv = aliasArray.join(',');
      $(this.onTypeDom).text(`${aliasCsv}が入力中です。`);
    }
  }
  
  receiveLogOut(args){
  
  }
}


/**
 * ccb、xDy、大括弧で括られた文字列を計算する。
 * その計算過程、計算結果を配列形式で返却する。
 *
 * execPlaceholder('可能:[2D6+2*(2Dccb+ccb)] シンタックスエラー[ccb++ccb] Bool[1==1>=ccb<=1]')
 *
 */
function execPlaceholder(text) {
  let postscript = [];
  
  // 大括弧でパースする
  let match = text.match(/\[([\s\d\+\-\*\/%\(\)<>=d]|ccb)+]/ig);
  if (match === null) {
    return [];
  }
  
  // 大括弧ごとの内容について処理
  match.forEach(function(v, i) {
    let exec  = v;
    let index = 0;
    let p     = [];
    
    // 置換可能なccb、またはxDyが存在する場合
    while (exec.match(/ccb/i) !== null || exec.match(/\d+d\d+/i)) {
      exec = exec
        .replace(/ccb/ig, function(v, i) {
          /*
           * ccbの置換。
           */
          let ccb   = Math.floor(Math.random() * 100) + 1;
          let flags = '';
          flags += ((ccb <= 5 && flags.indexOf('c') === -1) ? 'c' : '');
          flags += ((ccb >= 96 && flags.indexOf('f') === -1) ? 'f' : '');
          p.push(`  ccb[${index}]: ${ccb}${flags === '' ? '' : '(' + flags + ')'}`);
          
          index++;
          return ccb;
        })
        .replace(/\d+d\d+/ig, function(v, i) {
          /*
           * xDyの置換。
           * Dの前後の文字列から引数を取得し、置換を行う。
           */
          let array = v.split(/d/i);
          let args  = array.map(function(v, i) {
            try {
              return eval(v);
            } catch (e) {
              // evalでxDyの引数が計算不可能だった場合
              toast.error(`『v』を計算できませんでした。`);
              return null;
            }
          });
          
          if (args.some((v) => {
              return v === null;
            })) {
            // evalで置換に失敗していたパターン
            return 'ERROR';
          }
          let dies = [];
          
          for (i = 0; i < args[0]; i++) {
            dies.push(Math.floor(Math.random() * args[1]) + 1);
          }
          let answer = dies.reduce((x, y) => {
            return x + y;
          });
          
          p.push(`  xDy[${index}]: ${args[0]}D${args[1]} → 【${dies}】 → ${answer}`);
          index++;
          return answer;
        })
      
    }
    
    /*
     * 大括弧の中をevalで計算
     */
    let r = function(exec) {
      try {
        return eval(exec);
      } catch (e) {
        
        return 'SYNTAX ERROR!';
      }
    }(exec);
    p.push(`  ∴ ${exec} → ${r}`);
    postscript.push(p);
  });
  return postscript;
};

Object.assign(TextForm.prototype, Dialog.prototype);

module.exports = TextForm;
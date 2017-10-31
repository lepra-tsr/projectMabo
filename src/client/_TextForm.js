"use strict";

const CU                 = require('./commonUtil.js');
const command            = require('./_command.js');
const ChannelSelectorOut = require('./_ChannelSelectorOut.js');
const AvatarSelector     = require('./_AvatarSelector.js');
const Mediator           = require('./_Mediator.js');
const toast              = require('./_toast.js');
const Dialog             = require('./_Dialog');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class TextForm {
  /**
   * チャット入力フォームクラス
   * @param _socket
   * @constructor
   */
  constructor() {
    
    this.dom = undefined;
    
    /*
     * Dialog基底クラスのコンストラクタ
     */
    Dialog.call(this);
  
    this.socketId   = socket.id;
    this.text       = '';
    this.count      = 0;
    this.postscript = [];
    this.onType     = [];
    this.status     = 'blank';
    
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
     * 発言者設定セレクタ
     */
    this.avatarSelector = new AvatarSelector(socket);
    this.speakerStateDom  = this.avatarSelector.dom;
    
    
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
    $(this.dom).append($(this.speakerStateDom));
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
     * フキダシ更新
     */
    $(this.textAreaDom)
      .on('change keyup blur', () => {
        this.sendOnType();
      })
      .on('keypress', (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
          this.ret();
          return false;
        }
        this.sendOnType();
      });
    
    this.dialog({
      title   : 'Chat',
      width   : '310px',
      position: {at: 'right bottom'}
    });
  
  }
  
  get container() {
    return {
      socketId  : this.socketId,
      scenarioId: sInfo.id,
      speaker   : this.avatarSelector.speaker,
      state     : this.avatarSelector.state,
      text      : this.text,
      channel   : this.channelSelector.getSelectedName(),
      status    : this.status,
      count     : this.count,
      postscript: this.postscript
    }
  }
  
  /**
   * DOMから情報取得
   */
  getFormData() {
    this.speaker = this.avatarSelector.speaker;
    this.state = this.avatarSelector.state;
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
      scenarioId: sInfo.id,
      speaker   : this.speaker,
      status    : this.status
    };
    
    socket.emit('onType', type);
  }
  
  /**
   * onTypeのソケットを受信した時の処理
   * onTypeDomに、入力中の発言者を表示する
   */
  receiveOnType(container) {
    /*
     * onTypeの配列にupsertする
     * 先頭に追加してuniqueに
     */
    let item = {
      socketId: container.socketId,
      speaker   : container.speaker,
      status  : container.status,
    };
    
    this.onType = this.onType.filter((v) => {
      return v.socketId !== item.socketId;
    });
    this.onType.push(item);
    
    let speakerArray = this.onType
      .filter((v) => {
        return (v.status !== 'blank' && v.socketId !== socket.id)
      })
      .map((v) => {
        return v.speaker;
      });
    
    if (speakerArray.length === 0) {
      $(this.onTypeDom).text('');
    } else {
      let speakerCsv = speakerArray.join(',');
      $(this.onTypeDom).text(`${speakerCsv}が入力中です。`);
    }
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
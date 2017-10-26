"use strict";

const CU                 = require('./commonUtil.js');
const Mediator           = require('./_Mediator.js');
const toast              = require('./_toast.js');
const scenarioId         = CU.getScenarioId();

let socket = undefined;

/**
 * テキストフォームの発言者指定部分
 */
class AvatarSelector {
  
  get speaker() {
    return CU.htmlEscape($(this.speakerSelectDom).find('option:selected').attr('data-speaker') || '') || 'noname'
  }
  
  get state() {
    return CU.htmlEscape($(this.speakerSelectDom).find('option:selected').attr('data-state') || '') || 'none'
  }
  
  constructor(_socket) {
    
    socket = _socket;
    
    this.avatarConfig = [];
    
    /*
     * 発言者と状態
     */
    this.dom = $('<div></div>', {name: 'speakerSelector'});
    
    this.speakerEditButtonDom = $('<a></a>', {
      addClass: 'btn-flat waves-effect waves-teal teal-text',
    });
    $(this.speakerEditButtonDom).html('<i class="material-icons">create</i>');
    
    this.speakerSelectDom = $(`<select></select>`, {
      addClass: 'browser-default',
      name    : 'speaker-select',
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
    this.speakerInputDom = $(`<input>`, {
      addClass: 'speaker d-none',
      type    : 'form',
      css     : {
        'display'  : 'inline-block',
        "font-size": '2em',
        "margin"   : '0 0 0 0',
      }
    });
    $(this.dom).append($(this.speakerEditButtonDom));
    $(this.dom).append($(this.speakerSelectDom));
    $(this.dom).append($(this.speakerInputDom));
    
    
    /*
     * 立ち絵設定の変更を取り込む
     */
    socket.on('reloadAvatars', this.reloadAvatar.bind(this));
    
    /*
     * 発言者を非表示、テキストフォームを重ねて表示し全選択
     */
    $(this.speakerEditButtonDom).on('click', (e) => {
      toggleEditMode.call(this, true, e);
    });
    
    $(this.speakerSelectDom).on('change', () => {
      let speaker = $(this.speakerSelectDom).find('option:selected').attr('data-speaker');
      let state = $(this.speakerSelectDom).find('option:selected').attr('data-state');
      
      for (let i = 0; i < this.avatarConfig.length; i++) {
        let ac    = this.avatarConfig[i];
        ac.active = speaker === ac.speaker && state === ac.state;
      }
      
      /*
       * toastで発言者の変更通知
       */
      toast(`発言者を${speaker}##${state}へ変更`);
    });
    
    /*
     * フォームからフォーカスが外れたら、その値で発言者を更新
     */
    $(this.speakerInputDom)
      .on('blur', (e) => {
        toggleEditMode.call(this, false, e);
      })
      .on('keypress', (e) => {
        if (e.keyCode === 13 || e.key === 'Enter') {
          toggleEditMode.call(this, false, e);
        }
      });
    
    /**
     * チャットフォームの発言者編集ボタンを押した時・編集確定時
     *
     * @param edit
     * @param e
     */
    function toggleEditMode(edit, e) {
      if (edit === false) {
        /*
         * 編集確定
         */
        this.addTempSpeaker($(e.target).val());
        $(this.speakerSelectDom).removeClass('d-none');
        $(this.speakerInputDom).addClass('d-none');
      } else if (edit === true) {
        /*
         * 編集開始
         */
        $(this.speakerSelectDom).addClass('d-none');
        $(this.speakerInputDom).val(this.speaker).removeClass('d-none');
        this.speakerInputDom.focus().select();
      }
    }
    
    /*
     * 立ち絵設定をDBからロードする
     */
    this.reloadAvatar();
  }
  
  /**
   * 発言者変更時にコールするメソッド
   */
  addTempSpeaker(_newSpeaker) {
    /*
     * 発言者変更処理。有効な発言者でない場合は、フォームの値を以前の発言者へ戻す。
     * 発言者の変更を通知する。
     */
    let newRawSpeaker = _newSpeaker.trim();
    let newSpeaker    = CU.htmlEscape(newRawSpeaker);
    let oldSpeaker    = this.speaker;
    
    /*
     * 空文字はNG、maboもシステム用なのでNG
     */
    if (newRawSpeaker === '' || newRawSpeaker === 'mabo') {
      return false;
    }
    
    if (newRawSpeaker !== oldSpeaker) {
      toast(`発言者を${newSpeaker}へ変更`);
      this.pushTempOptions({label: newSpeaker});
      this.updateState();
      
      /*
       * ログイン時(空文字→socket.id)は通知しない
       */
      socket.emit('changeSpeaker', {speaker: oldSpeaker, newSpeaker: newSpeaker, scenarioId: scenarioId});
      return false;
    }
  }
  
  /**
   * 立ち絵設定をDBからロードし、セレクトボックスを書き出す
   */
  reloadAvatar() {
    fetchAvatarConfig.call(this)
      .then((r) => {
        /*
         * セレクトボックスの内容を立ち絵設定を使用して更新
         */
        this.avatarConfig = this.avatarConfig.concat(r);
        if (this.avatarConfig.length === 0) {
          this.pushTempOptions({label: this.speaker});
        }
        this.updateState();
      })
      .catch((r) => {
        console.error(r);
      });
    
    /**
     * DBから立ち絵設定を取得、ローカルのそれと連結する
     */
    function fetchAvatarConfig() {
      let query = CU.getQueryString({scenarioId: scenarioId});
      
      return CU.callApiOnAjax(`/avatars${query}`, 'get')
    }
    
  }
  
  /**
   * 立ち絵設定へ追加して選択フラグを立てる
   *
   * @param _tempOption
   */
  pushTempOptions(_tempOption) {
    
    let tempOption = this.parseSpeakerInput(_tempOption);
    
    for (let i = 0; i < this.avatarConfig.length; i++) {
      let o    = this.avatarConfig[i];
      o.active = false;
    }
    
    this.avatarConfig.push(tempOption);
  }
  
  /**
   * 発言者の文字列をパースして一時的な設定を取得する
   */
  parseSpeakerInput(_tempOption) {
    let tempOption = _tempOption;
    let parsedStr  = _tempOption.label.split('##');
    
    tempOption.state  = tempOption.state || parsedStr[1] || 'none';
    tempOption.speaker  = tempOption.speaker || parsedStr[0] || _tempOption.label || 'noname';
    tempOption.active = true;
    
    return tempOption;
  }
  
  /**
   * 立ち絵設定セレクトボックスを再生成する
   */
  updateState() {
    
    uniqueAvatarConfig.call(this);
    
    $(this.speakerSelectDom).empty();
    
    this.avatarConfig.forEach((ac) => {
      let o = $('<option></option>', {
        value       : ac.value,
        'data-speaker': ac.speaker,
        'data-state': ac.state,
      }).text(ac.label || `${ac.speaker}##${ac.state}`);
      if (ac.hasOwnProperty('active') && ac.active === true) {
        o.prop('selected', true);
      }
      $(this.speakerSelectDom).append($(o));
      
    });
    
    /**
     * 立ち絵設定のoptionを作成する前にユニークにする
     */
    function uniqueAvatarConfig() {
      
      let result = [];
      let active = this.avatarConfig.find((a) => {
        return a.hasOwnProperty('active') && a.active === true
      });
      
      for (let i = 0; i < this.avatarConfig.length; i++) {
        let a          = this.avatarConfig[i];
        let duplicated = false;
        
        for (let j = 0; j < this.avatarConfig.length; j++) {
          let needle = this.avatarConfig[j];
          
          if (i === j) {
            break;
          }
          
          duplicated = a.speaker === needle.speaker && a.state === needle.state;
          
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
          r.active = (active.speaker === r.speaker && active.state === r.state);
        })
      }
      
      this.avatarConfig = result;
    }
  }
  
}

module.exports = AvatarSelector;
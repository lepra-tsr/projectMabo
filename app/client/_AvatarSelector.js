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
  
  get alias() {
    return CU.htmlEscape($(this.aliasSelectDom).find('option:selected').attr('data-alias') || '') || 'noname'
  }
  
  get state() {
    return CU.htmlEscape($(this.aliasSelectDom).find('option:selected').attr('data-state') || '') || 'none'
  }
  
  constructor(_socket) {
    
    socket = _socket;
    
    this.avatarConfig = [];
    
    /*
     * 発言者と状態
     */
    this.dom = $('<div></div>', {name: 'aliasSelector'});
    
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
    $(this.dom).append($(this.aliasEditButtonDom));
    $(this.dom).append($(this.aliasSelectDom));
    $(this.dom).append($(this.aliasInputDom));
    
    
    /*
     * 立ち絵設定の変更を取り込む
     */
    socket.on('reloadAvatars', this.reloadAvatar.bind(this));
    
    /*
     * 発言者を非表示、テキストフォームを重ねて表示し全選択
     */
    $(this.aliasEditButtonDom).on('click', (e) => {
      toggleEditMode.call(this, true, e);
    });
    
    $(this.aliasSelectDom).on('change', () => {
      let alias = $(this.aliasSelectDom).find('option:selected').attr('data-alias');
      let state = $(this.aliasSelectDom).find('option:selected').attr('data-state');
      
      for (let i = 0; i < this.avatarConfig.length; i++) {
        let ac    = this.avatarConfig[i];
        ac.active = alias === ac.alias && state === ac.state;
      }
      
      /*
       * toastで発言者の変更通知
       */
      toast(`発言者を${alias}##${state}へ変更`);
    });
    
    /*
     * フォームからフォーカスが外れたら、その値で発言者を更新
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
        this.addTempAlias($(e.target).val());
        $(this.aliasSelectDom).removeClass('d-none');
        $(this.aliasInputDom).addClass('d-none');
      } else if (edit === true) {
        /*
         * 編集開始
         */
        $(this.aliasSelectDom).addClass('d-none');
        $(this.aliasInputDom).val(this.alias).removeClass('d-none');
        this.aliasInputDom.focus().select();
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
  addTempAlias(_newAlias) {
    /*
     * 発言者変更処理。有効な発言者でない場合は、フォームの値を以前の発言者へ戻す。
     * 発言者の変更を通知する。
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
      toast(`発言者を${newAlias}へ変更`);
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
          this.pushTempOptions({label: this.alias});
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
    
    let tempOption = this.parseAliasInput(_tempOption);
    
    for (let i = 0; i < this.avatarConfig.length; i++) {
      let o    = this.avatarConfig[i];
      o.active = false;
    }
    
    this.avatarConfig.push(tempOption);
  }
  
  /**
   * 発言者の文字列をパースして一時的な設定を取得する
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
   * 立ち絵設定セレクトボックスを再生成する
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
  
}

module.exports = AvatarSelector;
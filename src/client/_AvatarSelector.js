"use strict";

const CU           = require('./commonUtil.js');
const Mediator     = require('./_Mediator.js');
const toast        = require('./_toast.js');
const EditableSpan = require('./_EditableSpan.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

/**
 * テキストフォームの発言者指定部分
 */
class AvatarSelector {
  get speaker() {
    let val = this.es.val;
  
    return val.split('##')[0] || 'noname';
  }
  
  get state() {
    let val = this.es.val;
  
    return val.split('##')[1] || 'none';
  }
  
  get avatarConfig() {
    return this._avatarConfig;
  }
  
  set avatarConfig(value) {
    this._avatarConfig = value;
    /*
     * セレクトボックスに反映する
     */
    this.es.data = value.map((ac) => {
      return `${ac.speaker}##${ac.state}`
    })
  }
  
  get active() {
    return this.avatarConfig.find((ac) => {
      return ac.active === true;
    })
  }
  
  set active(speakerState) {
    let ss          = speakerState.split('##');
    let speaker     = ss[0] || 'noname';
    let state       = ss[1] || 'none';
    let isDuplicate = this.avatarConfig.some((ac) => {
      return speaker === ac.speaker && state === ac.state;
    });
    if (!isDuplicate) {
      this.avatarConfig = this.avatarConfig.concat({speaker: speaker, state: state});
    }
    
    this.avatarConfig.forEach((ac) => {
      ac.active = (ac.speaker === speaker && ac.state === state);
    });
    
    toast(`発言者を${this.speaker}##${this.state}へ変更`);
  }
  
  constructor() {
  
    this._avatarConfig = [];
  
    let timestamp = CU.timestamp();
    this.es       = new EditableSpan({
      id         : `selectSpeaker_${timestamp}`,
      label      : '発言者',
      placeholder: '発言者##状態',
      data       : [],
      onChange   : () => {
        this.active = this.es.val;
      }
    });
    this.dom      = this.es.$dom;
    
    /*
     * 立ち絵設定の変更を取り込む
     */
    socket.on('reloadAvatars', this.reloadAvatar.bind(this));
    
    /*
     * 立ち絵設定をDBからロードする
     */
    this.reloadAvatar();
  }
  
  /**
   * 立ち絵設定をDBからロードし、セレクトボックスを書き出す
   */
  reloadAvatar() {
    let query = CU.getQueryString({scenarioId: sInfo.id});
  
    CU.callApiOnAjax(`/avatars${query}`, 'get')
      .then((r) => {
        /*
         * セレクトボックスの内容を立ち絵設定を使用して更新
         */
        this.avatarConfig = this.avatarConfig.concat(r);
        if (this.avatarConfig.length === 0) {
          this.avatarConfig = [{
            speaker: this.speaker,
            state  : this.state,
            active : true
          }];
        }
      })
      .catch((r) => {
        console.error(r);
      });
  }
}

module.exports = AvatarSelector;
"use strict";

const CU           = require('./commonUtil.js');
const toast        = require('./_toast.js');
const EditableSpan = require('./_EditableSpan.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

/**
 * テキストフォームの発言者指定部分
 */
class AvatarSelector {
  
  static _reload() {
    AvatarSelector._instances.forEach((instance) => {
      instance.es.data = instance.avatarConfig.map((ac) => {
        return `${ac.speaker}##${ac.state}`
      });
      instance.es.render();
    })
  }
  
  get speaker() {
    let val = this.es.val;
  
    return val.split('##')[0] || 'noname';
  }
  
  get state() {
    let val = this.es.val;
  
    return val.split('##')[1] || 'none';
  }
  
  
  get avatarConfig() {
    return AvatarSelector._avatarConfig;
  }
  
  set avatarConfig(value) {
    /*
     * セレクトボックスに反映する
     */
    AvatarSelector._avatarConfig = value;
    AvatarSelector._reload();
  }
  
  /*
   * 立ち絵設定の結合。後勝ちでマージする。
   */
  addConfig(_config) {
    let config = (_config instanceof Array) ? _config : [_config];
    
    /*
     * 後方結合
     */
    let result = this.avatarConfig.concat(config);
    
    /*
     * 後ろ優先で重複削除
     */
    result.reverse();
    let normalized = [];
    for (let i = 0; i < result.length; i++) {
      let r = result[i];
      for (let j = 0; j <= i; j++) {
        let s = result[j];
        if (r.speaker === s.speaker && r.state === s.state) {
          if (i === j) {
            normalized.push(r);
          }
          break;
        }
      }
    }
    
    /*
     * 発言者でソート
     */
    let sorted = normalized.sort((a, b) => {
      return a.speaker < b.speaker ? -1 : 1;
    });
    
    this.avatarConfig = sorted;
  }
  
  constructor() {
  
    AvatarSelector._avatarConfig = (typeof AvatarSelector._avatarConfig === 'undefined')
      ? []
      : AvatarSelector._avatarConfig;
  
    AvatarSelector._instances = (typeof AvatarSelector._instances === 'undefined')
      ? []
      : AvatarSelector._instances;
    AvatarSelector._instances.push(this);
    
    let timestamp = CU.timestamp();
    this.id       = `selectSpeaker_${timestamp}`;
  
    this.es       = new EditableSpan({
      id         : this.id,
      label      : '発言者',
      placeholder: '発言者##状態',
      data       : [],
      onChange   : () => {
        /*
         * フォームの文字列を一時発言者としてセレクトボックスに反映する
         */
        let formStr = this.es.val;
        let ss      = formStr.split('##');
        let speaker = ss[0] || 'noname';
        let state   = ss[1] || 'none';
        this.addConfig({speaker: speaker, state: state});
  
        toast(`発言者を${this.speaker}##${this.state}へ変更`);
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
        let result = r.filter((ac) => {
          return ac.disp === true
        });
  
        this.addConfig(result);
        if (this.avatarConfig.length === 0) {
          this.avatarConfig = [{
            speaker: this.speaker,
            state  : this.state,
          }];
        }
      })
      .catch((r) => {
        console.error(r);
      });
  }
}

module.exports = AvatarSelector;
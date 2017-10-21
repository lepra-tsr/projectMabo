"use strict";

const CU              = require('./commonUtil.js');
const ChannelSelector = require('./_ChannelSelector');

require('dotenv').config();

const scenarioId = CU.getScenarioId();

/**
 * ChannelSelectorを継承した、チャット送信時のチャンネルセレクタ。
 *
 * @param _socket
 * @param config
 * @constructor
 */
let ChannelSelectorOut = function(_socket, config) {
  
  this.dom              = undefined;
  this.channelSelectDom = undefined;
  
  /*
   * 継承元のコンストラクタ実行
   */
  ChannelSelector.call(this, _socket, config);
  
  /*
   * チャンネル作成用input
   */
  this.channelAddDom = $(`<input>`, {
    addClass   : 'channel d-none',
    type       : 'form',
    placeholder: '追加するチャンネル名',
    css        : {
      "font-size": '2em',
    }
  });
  
  /*
   * イベント付与
   */
  $(this.channelSelectDom)
    .on('change', () => {
      let val = $(this.channelSelectDom).val();
      this.id = val;
    });
  /*
   * 右クリックでチャンネル作成用inputを表示
   */
  $(this.channelSelectDom)
    .on('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      $(this.channelSelectDom).addClass('d-none');
      $(this.channelAddDom).val('').removeClass('d-none');
      this.channelAddDom.focus().select();
      return false;
    });
  
  $(this.channelAddDom)
    .on('blur keypress', (e) => {
      
      /*
       * blurかエンターキーを押下したらチャンネル追加処理
       */
      if (e.type !== 'keypress' && e.type !== 'blur'
        ||
        e.keyCode !== 13 && e.type === 'keypress') {
        return;
      }
      
      let newName = (this.channelAddDom.val() || '').trim();
      
      /*
       * 既に存在するチャンネル名は不可
       */
      let alreadyExists = (this.list.findIndex((v) => {
        return v === newName;
      }) === -1);
      
      /*
       * 空文字でない文字列であり、既に登録済みでない場合のみ末尾に追加
       */
      if (typeof newName === 'string' && newName !== '' && alreadyExists === true) {
        this.list = this.list.concat([newName]);
        this.render();
        this.select(newName);
      }
      $(this.channelSelectDom).removeClass('d-none');
      $(this.channelAddDom).addClass('d-none');
    });
  
  /*
   * DOM組み立て
   */
  $(this.dom).append($(this.channelAddDom));
};

/*
 * ChannelSelectorを継承
 */
Object.assign(ChannelSelectorOut.prototype, ChannelSelector.prototype);

module.exports = ChannelSelectorOut;
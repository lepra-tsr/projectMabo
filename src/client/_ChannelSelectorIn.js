"use strict";

const CU              = require('./commonUtil.js');
const ChannelSelector = require('./_ChannelSelector');
const Mediator        = require('./_Mediator.js');
const mediator        = new Mediator();

require('dotenv').config();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class ChannelSelectorIn extends ChannelSelector {
  /**
   * ChannelSelectorを継承した、チャット履歴ダイアログ用のチャンネルセレクタ。
   *
   * @constructor
   * @param config
   */
  constructor(config) {
    super(config);
    this.channelSelectDom = this.channelSelectDom || undefined;
    
    /*
     * イベント付与
     */
    $(this.channelSelectDom)
      .on('change', () => {
        let val = $(this.channelSelectDom).val();
        this.id = val;
      });
  }
}

module.exports = ChannelSelectorIn;
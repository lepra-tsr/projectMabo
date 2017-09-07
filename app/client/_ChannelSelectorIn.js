"use strict";

const CU              = require('./commonUtil.js');
const ChannelSelector = require('./_ChannelSelector');

require('dotenv').config();

const scenarioId = CU.getScenarioId();

/**
 * ChannelSelectorを継承した、チャット受信時のチャンネルセレクタ。
 *
 * @param _socket
 * @param config
 * @constructor
 */
let ChannelSelectorIn = function(_socket, config) {
    /*
     * 継承元のコンストラクタ実行
     */
    ChannelSelector.call(this, _socket, config);
    
    /*
     * セレクトボックス切替時、
     * 紐付いたチャット履歴を再読込
     */
};

ChannelSelector.prototype.onChange = function() {
    let val = $(this.channelSelectDom).val();
    this.id = val;
}

ChannelSelector.prototype.contextmenu = function() {

}

/*
 * ChannelSelectorを継承
 */
ChannelSelectorIn.prototype = Object.create(ChannelSelector.prototype);

module.exports = ChannelSelectorIn;
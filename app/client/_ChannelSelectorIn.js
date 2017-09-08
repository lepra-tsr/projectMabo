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
    
    this.channelSelectDom = undefined;
    
    /*
     * 継承元のコンストラクタ実行
     */
    ChannelSelector.call(this, _socket, config);
    
    /*
     * イベント付与
     */
    $(this.channelSelectDom)
        .on('change', () => {
            let val = $(this.channelSelectDom).val();
            this.id = val;
        });
};

/*
 * ChannelSelectorを継承
 */
Object.assign(ChannelSelectorIn.prototype, ChannelSelector.prototype);

module.exports = ChannelSelectorIn;
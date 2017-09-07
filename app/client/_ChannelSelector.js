"use strict";

const CU       = require('./commonUtil.js');

require('dotenv').config();

const scenarioId = CU.getScenarioId();

let socket = undefined;

/**
 * チャンネル(選択オブジェクト)に対応するクラス。
 * @param _socket
 * @param config
 * @constructor
 */
let ChannelSelector = function(_socket, config) {
    socket        = _socket;
    this.socketId = socket.id;
    this.id       = 0;
    this.list     = [];
    this.config   = config;
    /*
     * DOM作成
     *
     * 本体div
     */
    this.dom = $(`<div></div>`, {});
    
    /*
     * セレクトボックス
     */
    this.channelSelectDom = $(`<select></select>`, {
        "addClass": 'browser-default',
        css       : {
            "height": '2rem',
            "width" : 'auto'
        }
    });
    
    /*
     * イベント付与
     */
    this.addEvent();
    
    /*
     * DOM組み立て
     */
    $(this.dom).append($(this.channelSelectDom));
    
    /*
     * Ajaxでチャンネルを取得、optionとして追加
     */
    this.optionDoms = [];
    this.getList()
        .done((result) => {
            this.list = (result instanceof Array && result.length !== 0) ? result : ['MAIN'];
            this.render();
            this.select(0);
        })
        .fail((error) => {
            console.error(error);
        });
};

/**
 *  ChannelSelectorクラスの共通部品についてのイベントリスナ
 */
ChannelSelector.prototype.addEvent = function() {
    /*
     * イベント付与
     */
    $(this.channelSelectDom)
        .on('change', () => {
            if (typeof this.onChange === 'function') {
                this.onChange();
            }
        });
    /*
     * 右クリックでチャンネル作成用inputを表示
     */
    $(this.channelSelectDom)
        .on('contextmenu', (e) => {
            if (typeof this.contextmenu === 'function') {
                this.contextmenu();
            }
        });
}

/**
 * Ajaxで現在のログからチャンネル一覧を取得する。
 * Promiseを返却する
 *
 * @returns {*}
 */
ChannelSelector.prototype.getList = function() {
    return CU.callApiOnAjax(process.env.API_EP_CHANNELS, 'get', {data: {scenarioId: scenarioId}})
};

/**
 * チャンネルをidまたは名前で指定し、プルダウンを選択状態にする
 * @param target
 * @returns {boolean}
 */
ChannelSelector.prototype.select = function(target) {
    switch (typeof target) {
        case 'number':
            this.id = target;
            break;
        case 'string':
            this.id = (this.getIdByName(target) !== false)
                ? this.getIdByName(target)
                : this.id;
            break;
        default:
            console.error('invalid key');
            return false;
    }
    $(this.channelSelectDom).val(this.id);
};

/**
 * チャンネル名からidを取得する
 * @param _target
 * @returns {*}
 */
ChannelSelector.prototype.getIdByName = function(_target) {
    let target = _target.trim();
    if (typeof target !== 'string' || target === '') {
        return false;
    }
    return this.list.findIndex((v) => {
        return v === target;
    })
};

/**
 * 現在プルダウンで選択中のチャンネル名を取得する
 * @returns {*}
 */
ChannelSelector.prototype.getSelectedName = function() {
    return this.list[parseInt(this.id)];
};

/**
 * 現在のプロパティのデータを使用してセレクトボックスを再描画する。
 * チャンネル追加時などから呼び出す
 */
ChannelSelector.prototype.render          = function() {
    this.optionDoms = [];
    this.list
        .filter((v, i, a) => {
            return a.indexOf(v) === i;
        });
    this.list.forEach((v, i) => {
        this.optionDoms.push($(`<option></option>`,
            {"value": `${i}`}).text(`${i}: ${v}`)
        );
    });
    $(this.channelSelectDom).empty();
    this.optionDoms.forEach((v) => {
        $(this.channelSelectDom).append($(v));
    });
};

module.exports = ChannelSelector;
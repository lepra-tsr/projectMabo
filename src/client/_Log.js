"use strict";

const CU       = require('./commonUtil.js');
const Mediator = require('./_Mediator.js');
const mediator = new Mediator();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

/**
 * チャット履歴データの保持、取得I/Fクラス
 * @param _socket
 * @param scenarioId
 * @constructor
 */
let Log = function() {
  
  this.list = [];
  
  
  socket.on('chatMessage', (container) => {
    /*
     * チャットを受信した際の処理
     */
    this.insert(container);
    
    /*
     * チャンネルの更新ハンドラをキック
     */
    mediator.emit('addChannel', container.channel);
  });
  
  socket.on('changeSpeaker', (container) => {
    /*
     * 発言者変更を受信した際の処理
     */
    this.insert(container);
  });
  
};

/**
 * チャット履歴データをストアする
 * @param _lines
 */
Log.prototype.insert = function(_lines) {
  /*
   * 入力が配列でなかった場合は配列へ変換
   */
  let lines = _lines instanceof Array === false ? [_lines] : _lines;
  
  /*
   * listへ追加
   */
  this.list.push(lines)
};

/**
 * Promise返却
 * DBからAjaxでシナリオに紐づく全チャットデータを取得
 */
Log.prototype.loadFromDB = function() {
  let query = CU.getQueryString({scenarioId: sInfo.id});
  return CU.callApiOnAjax(`/logs${query}`, 'get')
    .done((result) => {
      this.list = result
    });
};

module.exports = Log;
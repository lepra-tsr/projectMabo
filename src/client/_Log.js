"use strict";

const CU       = require('./commonUtil.js');
const Mediator = require('./_Mediator.js');
const mediator = new Mediator();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class Log {
  get list() {
    return Log._list;
  }
  
  set list(value) {
    Log._list = value;
  }
  
  /**
   * チャット履歴データの保持、取得I/Fクラス
   * @param _socket
   * @param scenarioId
   * @constructor
   */
  constructor() {
    if (typeof Log.instance === 'object') {
      return Log.instance
    }
    Log.instance = this;
    
    Log._list = [];
  
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
  
  }
  
  /**
   * チャット履歴データをストアする
   * @param _lines
   */
  insert(_lines) {
    /*
     * 入力が配列でなかった場合は配列へ変換
     */
    let lines = _lines instanceof Array === false ? [_lines] : _lines;
  
    /*
     * listへ追加
     */
    Log._list.push(lines)
  }
  
  /**
   * Promise返却
   * DBからAjaxでシナリオに紐づく全チャットデータを取得
   */
  loadFromDB() {
    let query = CU.getQueryString({scenarioId: sInfo.id});
    return CU.callApiOnAjax(`/logs${query}`, 'get')
      .done((result) => {
        this.list = result
      });
  }
}

module.exports = Log;
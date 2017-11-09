"use strict";

const CU       = require('./commonUtil.js');
const toast    = require('./_toast.js');
const Mediator = require('./_Mediator.js');
const mediator = new Mediator();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class ChannelSelector {
  /**
   * チャンネル(選択オブジェクト)に対応するクラス。
   * @param _socket
   * @param config
   * @constructor
   */
  constructor(config) {
    
    this.socketId = socket.id;
    this.list     = [];
    this.config   = config;
    /*
     * DOM作成
     *
     * 本体div
     */
    this.$dom = $(`<div></div>`, {});
    
    /*
     * セレクトボックス
     */
    this.$channelSelect = $(`<select></select>`, {
      "addClass": 'browser-default',
      css       : {
        "height": '2rem',
        "width" : 'auto'
      }
    });
    
    /*
     * DOM組み立て
     */
    $(this.$dom).append(this.$channelSelect);
    
    /*
     * Ajaxでチャンネルを取得、optionとして追加
     */
    this.optionDoms = [];
    this.getList()
      .done((result) => {
        /*
         * 登録したチャンネルがない場合は『MAIN』を作成し、
         * セレクトボックスを作成、選択状態にする
         */
        this.list = (result instanceof Array && result.length !== 0) ? result : ['MAIN'];
        this.render();
        this.select(0);
      })
      .fail((error) => {
        console.error(error);
      });
    
    mediator.on('addChannel', (channel) => {
      this.addList(channel);
    });
  }
  
  /**
   * Ajaxで現在のログからチャンネル一覧を取得する。
   * Promiseを返却する
   *
   * @returns {*}
   */
  getList() {
    let query = CU.getQueryString({scenarioId: sInfo.id});
    return CU.callApiOnAjax(`/logs/channels${query}`, 'get');
  }
  
  addList(ch) {
    let modified = false;
    let nowCh    = this.getSelectedName();
    
    if (typeof ch === 'string' && ch.trim() !== '') {
      modified = false || add.call(this, ch);
    } else if (ch instanceof Array === true) {
      ch.forEach((c) => {
        modified = false || add.call(this, c);
      })
    }
    if (modified) {
      this.render();
    }
    
    this.select(nowCh);
    
    function add(chStr) {
      let mod = false;
      if (this.list.indexOf(chStr) === -1) {
        this.list.push(chStr);
        mod = true;
        toast(`チャンネル: ${chStr}を追加しました`);
      }
      return mod;
    }
    
  }
  
  /**
   * チャンネルをidまたは名前で指定し、プルダウンを選択状態にする
   * @param target
   * @returns {boolean}
   */
  select(target) {
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
    this.$channelSelect.val(this.id);
  }
  
  /**
   * チャンネル名からidを取得する
   * @param _target
   * @returns {*}
   */
  getIdByName(_target) {
    let target = _target.trim();
    if (typeof target !== 'string' || target === '') {
      return false;
    }
    return this.list.findIndex((v) => {
      return v === target;
    })
  }
  
  /**
   * 現在プルダウンで選択中のチャンネル名を取得する
   * @returns {*}
   */
  getSelectedName() {
    this.id = parseInt(this.$channelSelect.val());
    return this.list[parseInt(this.id)];
  }
  
  /**
   * 現在のプロパティのデータを使用してセレクトボックスを再描画する。
   * チャンネル追加時などから呼び出す
   */
  render() {
    this.optionDoms = [];
    this.list       = this.list.filter((v, i, a) => {
      return a.indexOf(v) === i;
    });
    this.list.forEach((v, i) => {
      this.optionDoms.push($(`<option></option>`,
        {"value": `${i}`}).text(`${i}: ${v}`)
      );
    });
    this.$channelSelect.empty();
    this.optionDoms.forEach(($v) => {
      this.$channelSelect.append($v);
    });
  }
}

module.exports = ChannelSelector;
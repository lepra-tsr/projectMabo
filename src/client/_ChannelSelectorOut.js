"use strict";

const CU              = require('./commonUtil.js');
const ChannelSelector = require('./_ChannelSelector');
const Mediator        = require('./_Mediator.js');
const mediator        = new Mediator();

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class ChannelSelectorOut extends ChannelSelector {
  /**
   * ChannelSelectorを継承した、チャット送信時のチャンネルセレクタ。
   *
   * @param config
   * @constructor
   */
  constructor(config) {
    
    super(config);
  
    this.$dom           = this.$dom || undefined;
    this.$channelSelect = this.$channelSelect || undefined;
    
    /*
     * チャンネル作成用input
     */
    this.$channelAdd = $(`<input>`, {
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
    this.$channelSelect
      .on('change', () => {
        let val = this.$channelSelect.val();
        this.id = val;
      });
    /*
     * 右クリックでチャンネル作成用inputを表示
     */
    this.$channelSelect
      .on('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.$channelSelect.addClass('d-none');
        this.$channelAdd.val('').removeClass('d-none');
        this.$channelAdd.focus().select();
        return false;
      });
  
    this.$channelAdd
      .on('blur keypress', (e) => {
        
        /*
         * blurかエンターキーを押下したらチャンネル追加処理
         * 空文字でない文字列であり、既に登録済みでない場合のみ末尾に追加
         */
        if (!
            (e.type === 'blur' || (e.keyCode === 13 && e.type === 'keypress'))
        ) {
          return;
        }
  
        let newName = (this.$channelAdd.val() || '').trim();
        this.addList(newName);
        this.render();
        this.select(newName);
        this.$channelSelect.removeClass('d-none');
        this.$channelAdd.addClass('d-none');
      });
    
    /*
     * DOM組み立て
     */
    this.$dom.append(this.$channelAdd);
  }
}

module.exports = ChannelSelectorOut;
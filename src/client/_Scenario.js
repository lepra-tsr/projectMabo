"use strict";

const CU         = require('./commonUtil.js');
const toast      = require('./_toast.js');
const PlayGround = require('./_PlayGround.js');
const Avatar     = require('./_Avatar.js');
const Log        = require('./_Log');
const SideNav    = require('./_SideNav.js');

const ScenarioInfo = require('./_ScenarioInfo.js');
const sInfo        = new ScenarioInfo();
const socket       = sInfo.socket;

class Scenario {
  
  constructor() {
    if (typeof Scenario.instance === 'object') {
      return Scenario.instance
    }
    
    Scenario.instance = this;
    
    /*
     * チャットログのロードが完了してからサイドメニューを活性化
     */
    this.log = new Log();
    this.log.loadFromDB()
      .then(() => {
        
        toast('チャットログ読み込み...OK');
        
        /*
         * サイドメニュ
         */
        this.sideNav = new SideNav(this.playGround, this.log);
      })
      .catch((error) => {
        toast.error('チャットログ読み込み...NG');
      });
    
    /*
     * ボード群
     */
    this.playGround = new PlayGround();
    
    /*
     * 立ち絵表示
     */
    this.avatar = new Avatar();
  }
  
  die() {
    sInfo.id   = null;
    sInfo.name = null;
  }
}

module.exports = Scenario;
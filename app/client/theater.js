"use strict";

/*
 * materialize-css
 */
require('materialize-css');

/*
 * jquery-ui
 */
require('webpack-jquery-ui');

/*
 * 共通関数など
 */
const CU         = require('./commonUtil.js');
const toast      = require('./_toast.js');
const PlayGround = require('./_PlayGround.js');
const Avatar     = require('./_Avatar.js');
const Log        = require('./_Log');
const SideNav    = require('./_SideNav.js');


/*
 * socket.io
 */
const SOCKET_EP  = process.env.SOCKET_EP;
const socket     = io(SOCKET_EP);
const scenarioId = CU.getScenarioId();

socket.on('connect', () => {
  /*
   * 接続確立後、シナリオIDごとのsocket.roomへjoinするようサーバへ要請する
   */
  socket.emit('join', scenarioId);
});

socket.on('logIn', (payload) => {
  /*
   * ログイン通知
   */
  if (socket.id === payload.socketId) {
    return false;
  }
  toast.info(`${payload.socketId} がログインしました。`);
});
socket.on('logOut', (disconnectedId) => {
  let msg = `${disconnectedId}がログアウトしました`;
  toast(msg);
});

$(window)
  .ready(() => {
    
    /*
     * ブラウザバックの向き先をこのページにする(厳密なブラウザバックの禁止ではない)
     */
    history.pushState(null, null, null);
    window.addEventListener("popstate", function() {
      history.pushState(null, null, null);
    });
    
    document.title = CU.getScenarioName();
    
    /*
     * チャットログのロードが完了してからサイドメニューを活性化
     */
    const log = new Log(socket);
    log.loadFromDB()
      .then(() => {
        
        toast('チャットログ読み込み...OK');
        
        /*
         * サイドメニュ
         */
        const sideNav = new SideNav(playGround, socket, log);
      })
      .catch((error) => {
        toast.error('チャットログ読み込み...NG');
      });
    
    /*
     * ボード群
     */
    const playGround = new PlayGround(socket);
  
    /*
     * 立ち絵表示
     */
    const avatar = new Avatar(socket);
    
  })
  .focus(() => {
    /*
     * ウィンドウがアクティブに戻ったら、チャット入力欄をフォーカスする
     */
    // textForms[0].focus();
  });
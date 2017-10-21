"use strict";

/**
 * 処理の間隔を一定以上に固定する。
 * ディレイをミリ秒で指定してcallbackから実行して使用する。
 *
 * @param callback
 * @param delay
 * @private
 */
let Throttle            = function(callback, delay) {
  this.callback = callback;
  this.prevTime = new Date().getTime();
  this.delay    = delay;
  this.queued   = false;
};
Throttle.prototype.exec = function() {
  let now = new Date().getTime();
  if ((now - this.prevTime) >= this.delay) {
    
    this.prevTime = now;
    return this.callback.apply(null, arguments);
  } else {
    // console.log('  in delay.');
  }
};

module.exports = Throttle;
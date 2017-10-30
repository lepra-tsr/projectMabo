"use strict";

let toast = function(text, _cls, _duration) {
  
  let duration = (_duration && parseInt(_duration) === _duration) ? _duration : 4 * 1000;
  let cls      = _cls || '';
  
  if (text.toString().trim() === '') {
    return false;
  }
  
  Materialize.toast(text, duration, cls);
};

toast.error   = function(text) {
  toast(text, 'error', 20 * 1000);
};
toast.warn    = function(text) {
  toast(text, 'warn', 10 * 1000);
};
toast.success = function(text) {
  toast(text, 'success');
};
toast.info    = function(text) {
  toast(text, 'info', 2 * 1000);
};
toast.dim     = function(text) {
  toast(text, 'dim', 0.5 * 1000);
};

module.exports = toast;
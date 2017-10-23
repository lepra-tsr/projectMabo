"use strict";

const toast = require('./_toast.js');

let Animate = function() {
};

Animate.pop = function(dom) {
  let rawWidth = parseInt($(dom).css('width'));
  $(dom)
    .velocity({translateY: `-=20px`}, {duration: 100, easing:'swing', loop:false})
    .velocity('reverse')
    .velocity('reverse')
    .velocity('reverse')
};

module.exports = Animate;


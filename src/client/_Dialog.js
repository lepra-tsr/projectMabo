"use strict";

const CU = require('./commonUtil.js');

let Dialog = function() {
  this.$dom     = $(`<div></div>`).appendTo('body');
  this.$content = undefined;
  this.$dialog  = undefined;
  this.$title   = undefined;
};

Dialog.prototype.dialog = function(option) {
  if (typeof this.$dom === 'undefined') {
    console.error('Dom is not defined.'); // @DELETEME
    return false;
  }
  
  let config = {
    autoOpen     : true,
    resizable    : true,
    closeOnEscape: false,
    position     : {at: 'left center'},
    title        : `title`,
    classes      : {},
    buttons      : [],
    width        : '200px',
    height       : 'auto',
    dragStop     : () => {
      this.fitContent();
    },
    create       : () => {
      this.fitContent();
    },
    open         : () => {
      this.fitContent();
    },
    resizeStop   : () => {
      this.fitContent();
    },
    close        : function(e, ui) {
      /*
       * ダイアログを閉じるときはDOMごと消去する
       */
      $(this).dialog('destroy').remove();
    }
  };
  
  Object.keys(option).forEach((v) => {
    if (config.hasOwnProperty(v)) {
      config[v] = option[v];
    }
  });
  
  
  this.$content = this.$dom.dialog(config);
  this.$dialog  = this.$content.parent();
  this.$title   = this.$dialog.find('.ui-dialog-titlebar');
  this.fitContent();
};

Dialog.prototype.fitContent = function() {
  let height =
        parseInt($(this.$dialog).css('height'))
        - parseInt($(this.$dialog).css('padding-top'))
        - parseInt($(this.$dialog).css('border-top'))
        - parseInt($(this.$dialog).css('padding-bottom'))
        - parseInt($(this.$dialog).css('border-bottom'));
  let title  = parseInt($(this.$title).css('height'));
  
  $(this.$content).css({
    // width : "100%",
    // height: `${height - title}px`
  })
};

module.exports = Dialog;
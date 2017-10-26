"use strict";

const CU = require('./commonUtil.js');

const scenarioId = CU.getScenarioId();

/**
 * materiarizecssのModalのラッパクラス。
 * 継承するかcreateするかして使用する。
 *
 * this.modal: modal本体
 * this.modalContent: 本文
 *
 * @param config
 * @returns {boolean}
 * @constructor
 */
let Modal = function(config) {
  if (!config.hasOwnProperty('id')) {
    console.warn('idを指定してください。');
    return false;
  }
  let id            = config.id;
  let type          = (config.hasOwnProperty('type')) ? config.type : '';
  let title         = (config.hasOwnProperty('title')) ? config.title : '';
  let removeOnClose = (config.hasOwnProperty('removeOnClose')) ? config.removeOnClose : false;
  let option        = {
    complete: function() {
      if (removeOnClose !== true) {
        return false;
      }
      
      $(`#${id}`).remove();
    }
  };
  
  this.isOpen = false;
  
  this.modal = $(`<div></div>`, {
    id : id,
    css: {
      'max-height': 'none'
    }
  }).appendTo('body');
  
  switch (type) {
    case 'footer':
      $(this.modal).addClass('bottom-sheet');
      
      break;
    case 'fixed-footer':
      $(this.modal).addClass('modal-fixed-footer');
      
      break;
    default:
      
      break;
  }
  
  $(this.modal).addClass('modal');
  
  /*
   * モーダル本文
   */
  this.modalContent = $(`<div></div>`, {
    addClass: 'modal-content'
  });
  
  /*
   * フッタ
   */
  this.modalFooter = $(`<div></div>`, {
    addClass: 'modal-footer'
  });
  
  /*
   * タイトルを指定した場合は追加
   */
  if (title !== '') {
    this.modalTitle = $(`<h4></h4>`).text(title);
    $(this.modalContent).append($(this.modalTitle));
  }
  
  $(this.modal).append($(this.modalContent));
  $(this.modal).append($(this.modalFooter));
  
  $(this.modal).modal(option);
};

/**
 * hide状態のモーダルを表示する。destroyしたモーダルについては不可。
 */
Modal.prototype.show = function() {
  
  $(this.modal).modal('open');
  
  this.isOpen = true;
};

/**
 * open状態のモーダルを非表示にする。
 */
Modal.prototype.hide = function() {
  
  $(this.modal).modal('close');
  
  this.isOpen = false;
};

/**
 * モーダルのDOMを削除する。それらは再生できない。
 */
Modal.prototype.die = function() {
  $(this.modal).remove();
};

module.exports = Modal;
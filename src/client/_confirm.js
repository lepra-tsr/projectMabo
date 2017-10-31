"use strict";

const Modal = require('./_Modal.js');

/**
 *
 * @param title
 * @param question
 * @param id
 * @returns {Promise}
 */
function confirm(title, question, cnf) {
  
  let id = (cnf && cnf.hasOwnProperty('id') ) ? cnf.id : 'modalConfirm';
  
  let config = {
    id           : id,
    title        : title,
    type         : '',
    removeOnClose: false,
    dismissible  : false,
  };
  
  let modal = new Modal(config);
  
  let questionDom = $('<p></p>').text(question);
  
  let cancelButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effect waves-light',
  }).text('キャンセル');
  
  let acceptButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effect waves-light',
  }).text('OK');
  
  $(modal.modalContent).append(questionDom);
  $(modal.modalFooter).append(cancelButton);
  $(modal.modalFooter).append(acceptButton);
  modal.show();
  
  return new Promise((resolve, reject) => {
    $(cancelButton).on('click', () => {
      modal.hide();
      reject();
    });
    $(acceptButton).on('click', () => {
      modal.hide();
      resolve();
    });
  });
}

module.exports = confirm;
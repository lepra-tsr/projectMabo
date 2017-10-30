"use strict";

const Modal = require('./_Modal.js');

let prompt = function(title, question, id = 'modalPrompt') {
  let config = {
    id           : id,
    title        : title,
    type         : '',
    removeOnClose: false,
    dismissible  : false,
  };
  
  let modal = new Modal(config);
  
  let formDiv   = $('<div></div>', {addClass: 'input-field'});
  let formLabel = $('<label></label>', {
    for: id,
  }).text(question);
  let formInput = $('<input />', {
    id  : id,
    type: 'text',
  });
  
  let cancelButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effect waves-light',
  }).text('キャンセル');
  
  let acceptButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effect waves-light',
  }).text('OK');
  
  $(modal.modalContent).append(formDiv);
  $(formDiv).append(formLabel);
  $(formDiv).append(formInput);
  $(modal.modalFooter).append(cancelButton);
  $(modal.modalFooter).append(acceptButton);
  modal.show();
  
  return new Promise((resolve, reject) => {
    $(cancelButton).on('click', () => {
      modal.hide();
      reject();
    });
    $(acceptButton).on('click', () => {
      let input = $(formInput).val().trim();
      modal.hide();
      resolve(input);
    });
  });
};

module.exports = prompt;
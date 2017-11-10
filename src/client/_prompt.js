"use strict";

const Modal = require('./_Modal.js');

/**
 *
 * @param title
 * @param question
 * @param cnf
 * @returns {Promise}
 */
function prompt(title, question, cnf) {
  
  let id = (cnf && cnf.hasOwnProperty('id') )? cnf.id : 'modalPrompt';
  
  let config = {
    id           : id,
    title        : title,
    type         : '',
    removeOnClose: false,
    dismissible  : false,
    ready        : selectInput,
  };
  
  let modal = new Modal(config);
  
  let $formDiv   = $('<div></div>', {addClass: 'input-field'});
  let $formLabel = $('<label></label>', {
    for: id,
  }).text(question);
  let $formInput = $('<input />', {
    id  : id,
    type: 'text',
  });
  
  let $cancelButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effect waves-light',
  }).text('キャンセル');
  
  let $acceptButton = $('<a></a>', {
    type    : 'button',
    addClass: 'btn btn-flat waves-effect waves-light',
  }).text('OK');
  
  modal.$modalContent.append($formDiv);
  $formDiv.append($formLabel);
  $formDiv.append($formInput);
  modal.$modalFooter.append($cancelButton);
  modal.$modalFooter.append($acceptButton);
  modal.show();
  
  function selectInput() {
    $formInput.select();
  }
  
  return new Promise((resolve, reject) => {
    $cancelButton.on('click', () => {
      modal.hide();
      reject();
    });
    $formInput.on('keypress', (e) => {
      if (e.keyCode === 13) {
        returnInputValue();
      }
    });
    $acceptButton.on('click', () => {
      returnInputValue();
    });
  
    function returnInputValue() {
      let input = $formInput.val().trim();
      modal.hide();
      resolve(input);
    }
  });
}

module.exports = prompt;
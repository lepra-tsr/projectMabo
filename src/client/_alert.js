"use strict";

const Modal = require('./_Modal.js');

let alert = function(title, msg, cnf) {
  
  let id = (cnf && cnf.hasOwnProperty('id')) ? cnf.id : 'modalAlert';
  
  return new Promise((resolve, reject) => {
    let config = {
      id           : id,
      title        : title,
      type         : '',
      removeOnClose: true,
      dismissible  : true,
      complete     : reject
    };
    
    let modal = new Modal(config);
  
    let $msgDom = $('<p></p>').text(msg);
  
    let $acceptButton = $('<a></a>', {
      type    : 'button',
      addClass: 'btn btn-flat waves-effect waves-light',
    }).text('OK');
  
    modal.$modalContent.append($msgDom);
    modal.$modalFooter.append($acceptButton);
    modal.show();
  
    $acceptButton.on('click', () => {
      modal.hide();
      resolve();
    });
  });
};

module.exports = alert;
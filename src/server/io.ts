'use strict';


const io = function() {

  const nodeSocket = require('socket.io')();

  nodeSocket.on('connection', () => {
    console.log('connected!'); // @DELETEME
  });
  nodeSocket.listen(3001);
};

module.exports = io;

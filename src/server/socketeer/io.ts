'use strict';
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const port = env['SOCKET_PORT'];

const io = function () {

  const nodeSocket = require('socket.io')();

  nodeSocket.on('connection', (socket) => {
    console.log(`connected: ${socket.id}`);
    socket.emit('hello', `hello, ${socket.id}`);

    /* join request */
    socket.on('request:joinTo', ({socketId, roomId, hash}) => {
    const {joinToHandler} = require('./handler/joinToHandler');
      joinToHandler({socket, nodeSocket, socketId, roomId})
    });


  });
  nodeSocket.listen(port);
};


module.exports = io;

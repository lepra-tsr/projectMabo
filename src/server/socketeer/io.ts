'use strict';
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const port = env['SOCKET_PORT'];
const { slg } = require('../util/MaboLogger');

const io = function () {

  const nodeSocket = require('socket.io')();
  nodeSocket.on('connection', (socket) => {
    slg.debug(`connected: ${socket.id}`);
    socket.emit('hello', `hello, ${socket.id}`);

    /* join request */
    socket.on('joinTo', ({socketId, roomId, hash}) => {
      const {joinToHandler} = require('./handler/joinToHandler');
      joinToHandler({socket, nodeSocket, socketId, roomId, hash})
    });
  });
  nodeSocket.listen(port);
};


module.exports = io;

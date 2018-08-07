'use strict';
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const port = env['SOCKET_PORT'];
const { slg } = require('../util/MaboLogger');
const { joinToHandler } = require('./handler/joinToHandler');
const { disconnectedHandler } = require('./handler/disconnectedHandler');

const io = function () {
  const nodeSocket = require('socket.io')();
  nodeSocket.on('connection', (socket) => {
    slg.debug(`connected: ${socket.id}`);
    socket.to(socket.id).emit('hello', `hello, ${socket.id}`);

    /* join request */
    socket.on('joinTo', ({ socketId, roomId, hash }) => {
      joinToHandler({ socket, nodeSocket, socketId, roomId, hash })
    });


    socket.on('disconnect', (reason) => {
      slg.debug(`disconnected: ${socket.id}. ${reason}`);
      /* @TODO User deletion */
      disconnectedHandler({ socket, nodeSocket })
        .then(() => {
          slg.debug(`disconnection well done.`);
        }).catch((e) => {
          slg.debug(e);
        });
    });
  });
  nodeSocket.listen(port);
};


module.exports = io;

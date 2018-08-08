'use strict';
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const port = env['SOCKET_PORT'];
const { slg } = require('../util/MaboLogger');
const { joinToHandler } = require('./handler/joinToHandler');
const { disconnectedHandler } = require('./handler/disconnectedHandler');

class Io {
  static nodeSocket;
  static start() {
    const nodeSocket = require('socket.io')();
    Io.nodeSocket = nodeSocket;

    nodeSocket.on('connection', (socket) => {
      slg.debug(`connected: ${socket.id}`);
      socket.to(socket.id).emit('hello', `hello, ${socket.id}`);

      /* join request */
      socket.on('joinTo', ({ socketId, roomId, hash,name }) => {
        joinToHandler({ socket, nodeSocket, socketId, roomId, hash,name });
      });

      socket.on('disconnect', async (reason) => {
        slg.debug(`disconnected: ${socket.id}. ${reason}`);
        try {
          await disconnectedHandler({ socket, nodeSocket })
          slg.debug(`disconnection well done.`);
        } catch (error) {
          slg.debug(`error occurred on disconnect: ${error}`);
        }
      });
    });
    nodeSocket.listen(port);
  }

  static roomEmit(roomId: string, key: string, data) {
    slg.debug(`roomEmit to ${roomId}: ${key}`, data);
    Io.nodeSocket.in(roomId).emit(key, data);
  }
};

module.exports = Io;

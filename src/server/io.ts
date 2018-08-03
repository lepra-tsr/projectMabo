'use strict';
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const port = env['SOCKET_PORT'];

const io = function() {

  const nodeSocket = require('socket.io')();

  nodeSocket.on('connection', (socket) => {
    console.log(`connected: ${socket.id}`);
    socket.emit('hello', `hello, ${socket.id}`)

    socket.on('request:joinTo', ({ socketId, roomId, hash }) => {
      socket.join(roomId, () => {
        console.log(` ---> ${socketId} joins to: ${roomId}`); // @DELETEME
        nodeSocket.to(roomId).emit('joinInfo',`here comes: ${socketId}`);
      });
    })
  });
  nodeSocket.listen(port);
};

module.exports = io;

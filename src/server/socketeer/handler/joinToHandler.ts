"use strict";

export const joinToHandler = ({socket, nodeSocket, socketId, roomId}: {
  socket,
  nodeSocket,
  socketId: string,
  roomId: string
}) => {
  socket.join(roomId, () => {
    console.log(` ---> ${socketId} joins to: ${roomId}`);
    nodeSocket.to(roomId).emit('joinInfo', `here comes: ${socketId}`);

    /* insert connect and user */
    
  });
};

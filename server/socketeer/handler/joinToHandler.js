"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinToHandler = function (_a) {
    var socket = _a.socket, nodeSocket = _a.nodeSocket, socketId = _a.socketId, roomId = _a.roomId;
    socket.join(roomId, function () {
        console.log(" ---> " + socketId + " joins to: " + roomId);
        nodeSocket.to(roomId).emit('joinInfo', "here comes: " + socketId);
        /* insert connect and user */
    });
};

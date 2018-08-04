'use strict';
var dotenv = require('dotenv');
var env = dotenv.config().parsed;
var port = env['SOCKET_PORT'];
var io = function () {
    var nodeSocket = require('socket.io')();
    nodeSocket.on('connection', function (socket) {
        console.log("connected: " + socket.id);
        socket.emit('hello', "hello, " + socket.id);
        /* join request */
        socket.on('request:joinTo', function (_a) {
            var socketId = _a.socketId, roomId = _a.roomId, hash = _a.hash;
            socket.join(roomId, function () {
                console.log(" ---> " + socketId + " joins to: " + roomId);
                nodeSocket.to(roomId).emit('joinInfo', "here comes: " + socketId);
                /* insert connect and user */
            });
        });
    });
    nodeSocket.listen(port);
};
module.exports = io;

// wwwから呼び出すモジュール
// サーバサイドで稼働する
var app = require('../app');
var http = require('http');
var server = http.createServer(app);
var chatSocket = require('socket.io').listen(server);


// 接続中
chatSocket.on('connection', function(socket) {
    console.info('connected!'); // @DELETEME

    var container = {
        socketId: socket.id,
        data: {}
    };

    // 接続時
    var msg = 'someone logged in! id: ' + socket.id;
    chatSocket.emit('logIn', {name: '', msg: msg});

    // チャット発言を受け取った時
    socket.on('chatMessage', function(_container) {
        console.log('chatMessage'); // @DELETEME
        console.info(_container); // @DELETEME
        var name = _container.data.name;
        var text = _container.data.text;

        var msg = name + ': ' + text;
        container.data.name = name;
        container.data.text = text;
        container.data.msg = msg;
        console.log(container); // @DELETEME
        chatSocket.emit('chatMessage', container);
    });

    // チャットステータスイベントを受け取った時
    socket.on('typingStatus', function(_container) {
        console.log('typingStatus'); // @DELETEME
        console.log(_container); // @DELETEME

        container.msg = _container.data.name + _container.data.text;
        container.data.name = _container.data.name;
        container.data.text = _container.data.text;
        console.log(container); // @DELETEME
        chatSocket.emit('typingStatus', container);
    });

    // ユーザー名変更イベントを受け取った時
    socket.on('userNameChange', function(data) {
        console.log('user: ' + data.name + ' -> ' + data.newName); // @DELETEME
        data.msg = 'userNameChange: ' + data.name + ' -> ' + data.newName;
        chatSocket.emit('userNameChange', data);
    });

    // 接続後の切断時
    socket.on('disconnect', function() {
        console.info('disconnected!'); // @DELETEME
        chatSocket.emit('logOut', 'someone logged out!');
    });
});

module.exports = chatSocket;
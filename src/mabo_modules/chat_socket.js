// wwwから呼び出すモジュール
// サーバサイドで稼働する
var app = require('../app');
var http = require('http');
var server = http.createServer(app);
var chatSocket = require('socket.io').listen(server);


// 接続中
chatSocket.on('connection', function(clientSocket) {
    console.info('connected!'); // @DELETEME

    var container = {
        socketId: clientSocket.id,
        data: {}
    };

    // 接続時
    chatSocket.emit('logIn', container);

    // チャット発言を受け取った時
    clientSocket.on('chatMessage', function(_container) {
        console.log('chatMessage'); // @DELETEME
        console.info(_container); // @DELETEME
        var name = _container.data.name;
        var text = _container.data.text;
        var postscript = _container.data.postscript;

        var msg = name + ': ' + text;
        container.data.name = name;
        container.data.text = text;
        container.data.msg = msg;
        container.data.postscript = postscript;
        console.log(container); // @DELETEME
        chatSocket.emit('chatMessage', container);
    });

    // チャットステータスイベントを受け取った時
    clientSocket.on('onType', function(container) {
        console.log('onType'); // @DELETEME
        console.log(container); // @DELETEME

        chatSocket.emit('onType', container);
    });

    // ユーザー名変更イベントを受け取った時
    clientSocket.on('userNameChange', function(data) {
        console.log('user: ' + data.name + ' -> ' + data.newName); // @DELETEME
        data.msg = 'userNameChange: ' + data.name + ' -> ' + data.newName;
        chatSocket.emit('userNameChange', data);
    });

    // 接続後の切断時
    clientSocket.on('disconnect', function() {
        console.info('disconnected!'); // @DELETEME
        chatSocket.emit('logOut', {msg:'someone logged out!'});
    });
});

module.exports = chatSocket;
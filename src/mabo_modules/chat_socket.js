/*
 * wwwから呼び出すモジュール
 * サーバサイドで稼働する
 */
var app        = require('../app');
var http       = require('http');
var server     = http.createServer(app);
var io         = require('socket.io')();
var chatSocket = io.listen(server);
var mc         = require('mongodb').MongoClient;
var assert     = require('assert');
var mongoPath  = 'mongodb://localhost:27017/test';

function getConnected(_io) {
    var connected = undefined;
    _io.clients(function(error, clients) {
        connected = clients;
    });
    return connected;
}

// 接続中
chatSocket.on('connection', function(clientSocket) {
    console.info('connected!'); // @DELETEME
    
    /*
     * レスポンスの概形を作成
     */
    var container = {
        socketId: clientSocket.id,
        data    : {}
    };
    
    /*
     * 接続時のログイン通知
     */
    chatSocket.emit('logIn', container);
    
    /*
     * DBへエイリアスの登録
     */
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);

        var record    = {
            socketId: clientSocket.id,
            roomId  : 0,
            alias   : undefined
        };
        var connected = Object.keys(chatSocket.eio.clients);

        console.info('all users are:');
        console.info(connected);

        /*
         * 新しいエイリアスで上書き、または新規登録
         */
        db.collection('alias')
            .updateOne({socketId: clientSocket.id}, record, {upsert: true});

        /*
         * 現在接続中でないドキュメントは削除
         */
        db.collection('alias')
            .deleteMany({
                $and: [
                    {socketId: {$nin: connected}},
                    {roomId: {$eq: 0}}
                ]
            });
        db.close();
    });
    
    /*
     * チャット発言を受け取った時。
     */
    clientSocket.on('chatMessage', function(container) {
        container.data.msg = container.data.alias + ': ' + container.data.text;
        console.log('chatMessage => ' + container.data.msg); // @DELETEME
        
        /*
         * chatへ登録
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);
            
            var record = {
                socketId  : clientSocket.id,
                alias     : container.data.alias,
                text      : container.data.text,
                postscript: container.data.postscript
            };
            
            db.collection('chat')
                .insertOne(record);
            db.close();
        });
        
        chatSocket.emit('chatMessage', container);
    });
    
    // チャットステータスイベントを受け取った時
    clientSocket.on('onType', function(container) {
        console.log('onType => ' + container.data.alias + ': ' + container.data.thought); // @DELETEME
        chatSocket.emit('onType', container);
    });
    
    // エイリアス名変更イベントを受け取った時
    clientSocket.on('changeAlias', function(data) {
        data.msg = 'changeAlias: ' + data.alias + ' → ' + data.newAlias;
        console.log('changeAlias => ' + data.msg); // @DELETEME

        /*
         * aliasへエイリアスを登録、chatへ変更履歴を保存
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);

            var recordAlias = {
                socketId: clientSocket.id,
                roomId  : 0,
                alias   : data.newAlias,
            };
            db.collection('alias')
                .updateOne({socketId: clientSocket.id}, recordAlias, {upsert: true});

            var recordChat = {
                socketId  : clientSocket.id,
                alias     : data.newAlias,
                text      : data.msg
            };
            db.collection('chat')
                .insertOne(recordChat);

            db.close();
        });

        chatSocket.emit('changeAlias', data);
    });
    
    /*
     * 切断時の処理
     */
    clientSocket.on('disconnect', function() {
        console.info('disconnected!');
        chatSocket.emit('logOut', {msg: clientSocket.id + ' がログアウトしました。'});
    
        /*
         * DBのエイリアスから削除
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);
        
            db.collection('alias')
                .deleteMany({socketId: clientSocket.id});
        });

    });
});

module.exports = chatSocket;
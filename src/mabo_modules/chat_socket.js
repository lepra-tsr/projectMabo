/*
 * wwwから呼び出すモジュール
 * サーバサイドで稼働する
 */
let app         = require('../app');
let http        = require('http');
let server      = http.createServer(app);
let io          = require('socket.io')();
let chatSocket  = io.listen(server);
let mc          = require('mongodb').MongoClient;
let assert      = require('assert');
let def         = require('../mabo_modules/def');
const mongoPath = def.mongoPath;


// 接続中
chatSocket.on('connection', function(clientSocket) {
    console.info('connected!'); // @DELETEME
    
    /*
     * レスポンスの概形を作成
     */
    let container = {
        socketId  : clientSocket.id,
        scenarioId: undefined,
        data      : {}
    };
    
    mc.connect(mongoPath, function(error, db) {
        /*
         * 接続時、DBへエイリアスの登録
         */
        assert.equal(null, error);

        let record    = {
            socketId: clientSocket.id,
            alias   : undefined
        };
        let connected = Object.keys(chatSocket.eio.clients);

        console.info('all users are:');
        console.info(connected);

        /*
         * 新しいエイリアスで上書き、または新規登録
         * 現在接続中でないドキュメントは削除
         */
        db.collection('alias')
            .updateOne({socketId: clientSocket.id}, record, {upsert: true});
    
        db.collection('alias')
            .deleteMany({
                $and: [
                    {socketId: {$nin: connected}},
                    {scenarioId: {$eq: 0}}
                ]
            });
        db.close();
    });
    
    clientSocket.on('join', function(scenarioId) {
        /*
         * ログイン後通知
         */
        clientSocket.join(scenarioId, function() {
            chatSocket.to(clientSocket.id).emit('welcome', scenarioId);
            
            mc.connect(mongoPath, function(error, db) {
                assert.equal(null, error);
                /*
                 * エイリアスに接続先のシナリオを登録
                 */
                db.collection('alias')
                    .updateOne({socketId: clientSocket.id}, {$set: {scenarioId: scenarioId}});
                db.close();
                
                /*
                 * 接続時のログイン通知
                 */
                chatSocket.to(scenarioId).emit('logIn', container);
            });
        });
    });
    
    /*
     * チャット発言を受け取った時。
     */
    clientSocket.on('chatMessage', function(container) {
        container.data.msg = container.data.alias + ': ' + container.data.text;
        console.log('chatMessage => ' + container.data.msg); // @DELETEME
    
        let socketId   = clientSocket.id;
        let scenarioId = container.scenarioId;
        let alias      = container.data.alias;
        let text       = container.data.text;
        let postscript = container.data.postscript;
        
        /*
         * chatへ登録
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);
            
            let record = {
                socketId  : socketId,
                scenarioId: scenarioId,
                alias     : alias,
                text      : text,
                postscript: postscript,
            };
            
            db.collection('chat')
                .insertOne(record);
            db.close();
        });
    
        chatSocket.to(scenarioId).emit('chatMessage', container);
    });
    
    // チャットステータスイベントを受け取った時
    clientSocket.on('onType', function(container) {
        let scenarioId = container.scenarioId;
        console.log('onType => ' + container.data.alias + ': ' + container.data.thought); // @DELETEME
        chatSocket.to(scenarioId).emit('onType', container);
    });
    
    // エイリアス名変更イベントを受け取った時
    clientSocket.on('changeAlias', function(data) {
        data.msg = 'changeAlias: ' + data.alias + ' → ' + data.newAlias;
        console.log('changeAlias => ' + data.msg); // @DELETEME
        let scenarioId = data.scenarioId;

        /*
         * aliasへエイリアスを登録、chatへ変更履歴を保存
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);

            let recordAlias = {
                socketId  : clientSocket.id,
                scenarioId: scenarioId,
                alias     : data.newAlias,
            };
            db.collection('alias')
                .updateOne({socketId: clientSocket.id}, recordAlias, {upsert: true});

            let recordChat = {
                socketId  : clientSocket.id,
                scenarioId: scenarioId,
                alias     : data.newAlias,
                text      : data.msg
            };
            db.collection('chat')
                .insertOne(recordChat);

            db.close();
        });
    
        chatSocket.to(scenarioId).emit('changeAlias', data);
    });
    
    /*
     * 全更新リソースの更新リクエスト
     */
    clientSocket.on('reloadRequest', function(data) {
        console.log(`reloadRequest: ${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('reloadRequest', data);
    });
    
    /*
     * 切断時の処理
     */
    clientSocket.on('disconnect', function() {
        console.info('disconnected!');
        // chatSocket.to().emit('logOut', {msg: clientSocket.id + ' がログアウトしました。'});
        /*
         * DBのエイリアスから削除
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);
        
            db.collection('alias')
                .findOneAndDelete({socketId: clientSocket.id}, function(error, doc) {
                    chatSocket.to().emit('logout', {msg: `(${doc.alias || doc.socketId})がログアウトしました。`});
                });
        });

    });
});

module.exports = chatSocket;
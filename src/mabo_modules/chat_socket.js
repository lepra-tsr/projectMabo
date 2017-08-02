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

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

// 接続中
chatSocket.on('connection', function(clientSocket) {
    console.info(' --> connected!'); // @DELETEME
    
    /*
     * レスポンスの概形を作成
     */
    let container = {
        socketId  : clientSocket.id,
        scenarioId: undefined,
        data      : {}
    };
    
    /*
     * 接続時、DBへエイリアスの登録
     * 新しいエイリアスで上書き、または新規登録
     * 現在接続中でないドキュメントは削除
     */
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);

        let record    = {
            socketId: clientSocket.id,
            alias   : undefined
        };
        let connected = Object.keys(chatSocket.eio.clients);
        console.info(`     all users are: ${JSON.stringify(connected)}`);
        
        let updateCriteria = {socketId: clientSocket.id};
        let deleteCriteria = {
            $and: [
                {socketId: {$nin: connected}},
                {scenarioId: {$eq: 0}}
            ]
        };
        
        db.collection('alias')
            .updateOne(updateCriteria, record, {upsert: true}, function(error, ack) {
                assert.equal(error, null);
                db.collection('alias')
                    .deleteMany(deleteCriteria);
            });
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
     * チャットステータスイベントを受け取った時
     */
    clientSocket.on('onType', function(container) {
        let scenarioId = container.scenarioId;
        console.log(` --> onType => ${container.alias}: ${container.thought}`); // @DELETEME
        chatSocket.to(scenarioId).emit('onType', container);
    });
    
    /*
     * チャット発言を受け取った時。
     */
    clientSocket.on('chatMessage', function(container) {
        console.log(` --> chatMessage => ${container.alias}: ${container.text}`);
        let scenarioId = container.scenarioId;
        let record     = {
            scenarioId: scenarioId,
            socketId  : clientSocket.id,
            alias     : container.alias,
            text      : container.text,
            postscript: container.postscript,
        };
 
        /*
         * chatへ登録
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);
    
            db.collection('logs')
                .insertOne(record);
            db.close();
        });
    
        chatSocket.to(scenarioId).emit('chatMessage', record);
    });
    
    /*
     * エイリアス名変更イベントを受け取った時
     */
    clientSocket.on('changeAlias', function(data) {
        data.msg = `changeAlias: ${data.alias} → ${data.newAlias}`;
        console.log(` --> changeAlias => ${data.msg}`); // @DELETEME
        let scenarioId = data.scenarioId;
    
        let recordAlias = {
            socketId  : clientSocket.id,
            scenarioId: scenarioId,
            alias     : data.newAlias,
        };
        
        let recordChat = {
            socketId  : clientSocket.id,
            scenarioId: scenarioId,
            alias     : data.newAlias,
            text      : data.msg
        };
        
        /*
         * aliasへエイリアスを登録、chatへ変更履歴を保存
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);

            db.collection('alias')
                .updateOne({socketId: clientSocket.id}, recordAlias, {upsert: true});
            db.collection('logs')
                .insertOne(recordChat);
            db.close();
        });
    
        chatSocket.to(scenarioId).emit('changeAlias', recordChat);
    });
    
    /*
     * キャラクター表の更新リクエスト
     */
    clientSocket.on('reloadCharacters',function(data){
        console.log(` --> reloadCharacters:${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('reloadCharacters',data)
    });
    
    /*
     * 新規ボードをDBに登録した際のDOM作成リクエスト
     */
    clientSocket.on('deployBoards',function(data){
        console.log(` --> deployBoards:${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('deployBoards', data);
    });
    
    /*
     * ボードをDBから削除した際のDOM削除リクエスト
     */
    clientSocket.on('destroyBoards',function(data){
        console.log(` --> destroyBoards:${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('destroyBoards', data);
    });
    
    /*
     * 新規コマをDBへ登録した際のDOM作成リクエスト
     */
    clientSocket.on('deployPawns',function(data){
        console.log(` --> deployPawns:${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('deployPawns', data);
    });
    
    /*
     * コマの移動をした際のリクエスト
     */
    clientSocket.on('movePawns', function(data) {
        console.log(` --> movePawns:${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('movePawns', data);
        mc.connect(mongoPath, function(error, db) {
            assert.equal(error, null);
            /*
             * criteriaを構成する要素は全て必須
             */
            let criteria = {
                scenarioId : {$eq: data.scenarioId},
                boardId    : {$eq: data.boardId},
                characterId: {$eq: data.characterId},
                dogTag     : {$eq: data.dogTag}
            };
            let top      = data.axis.top;
            let left     = data.axis.left;
            
            console.log(criteria); // @DELETEME
            db.collection('pawns')
                .find(criteria, {_id: 1, meta: 1})
                .toArray(function(error, doc) {
                    assert.equal(null, error);
                    let _id = doc[0]._id;
                    delete doc[0]._id;
                    let meta = doc[0].meta || {style: {}};
                    if (typeof top !== 'undefined') {
                        meta.style.top = top;
                    }
                    if (typeof left !== 'undefined') {
                        meta.style.left = left;
                    }
                    console.log(`meta: ${meta}`); // @DELETEME
                    db.collection('pawns')
                        .updateOne({_id: {$eq: _id}}, {$set: {meta: meta}}, {upsert: true});
                })
        })
    });
    
    /*
     * コマをDBから削除した際のDOM削除リクエスト
     */
    clientSocket.on('destroyPawns',function(data){
        console.log(` --> destroyPawns:${JSON.stringify(data)}`);
        chatSocket.to(data.scenarioId).emit('destroyPawns', data);
    });
    
    /*
     * 切断時の処理
     */
    clientSocket.on('disconnect', function() {
        console.info(` --> disconnected: ${clientSocket.id}`);
        /*
         * DBのエイリアスから削除
         */
        mc.connect(mongoPath, function(error, db) {
            assert.equal(null, error);
    
            db.collection('alias')
                .findOneAndDelete({socketId: {$eq: clientSocket.id}}, function(error, doc) {
                    let scenarioId = doc.value.scenarioId;
                    let alias      = doc.value.alias;
                    let socketId   = doc.value.socketId;
                    chatSocket.to(scenarioId).emit('logOut', `${alias || socketId}がログアウトしました。`);
                });
        });

    });
});

module.exports = chatSocket;
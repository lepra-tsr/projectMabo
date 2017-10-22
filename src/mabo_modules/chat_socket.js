/*
 * wwwから呼び出すモジュール
 * サーバサイドで稼働する
 */
let app        = require('../app');
let http       = require('http');
let server     = http.createServer(app);
let io         = require('socket.io')();
let chatSocket = io.listen(server);
let mc         = require('mongodb').MongoClient;
let assert     = require('assert');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

// 接続中
chatSocket.on('connection', (clientSocket) => {
  console.info(' --> connected!'); // @DELETEME
  
  let scenarioId = undefined;
  
  clientSocket.on('join', (_scenarioId) => {
    
    /*
     * 接続中のシナリオID
     */
    scenarioId = _scenarioId;
    
    /*
     * 現在接続中の、他シナリオ含め全接続を取得
     */
    let connected = Object.keys(chatSocket.eio.clients);
    
    /*
     * 現在接続中でないソケットIDのレコードを全て削除
     */
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
      
      let deleteCriteria = {socketId: {$nin: connected}};
      db.collection('users')
        .deleteMany(deleteCriteria, (error, ack) => {
          
          /*
           * usersコレクションに接続情報を追加
           */
          let updateCriteria = {socketId: {$eq: clientSocket.id}};
          let record         = {
            socketId  : clientSocket.id,
            scenarioId: scenarioId
          };
          db.collection('users')
            .updateOne(updateCriteria, record, {upsert: true}, (error, ack) => {
              assert.equal(null, error);
              console.log(`\u001b[36m`); // cyan
              console.log('ログイン情報登録完了');
              console.log(`接続中: ${JSON.stringify(connected)}`);
              console.log(`\u001b[0m`); // reset
              
              /*
               * ルームへ参加、ルームのキーはシナリオID
               */
              clientSocket.join(scenarioId, () => {
                
                /*
                 * ルームへログイン通知を発信
                 */
                chatSocket.to(scenarioId).emit('logIn', {socketId: clientSocket.id});
              });
            })
        });
    });
  });
  
  /*
   * チャットステータスイベントを受け取った時
   */
  clientSocket.on('onType', (container) => {
    console.log(` --> onType => ${container.alias}: ${container.status}`);
    chatSocket.to(scenarioId).emit('onType', container);
  });
  
  /*
   * チャット発言を受け取った時。
   */
  clientSocket.on('chatMessage', (container) => {
    console.log(` --> chatMessage => [${container.channel}] ${container.alias}##${container.state}: ${container.text}`);
    let record = {
      scenarioId: scenarioId,
      socketId  : clientSocket.id,
      alias     : container.alias,
      state     : container.state || undefined,
      text      : container.text,
      channel   : container.channel,
      postscript: container.postscript,
    };
  
    chatSocket.to(scenarioId).emit('chatMessage', record);
    
    /*
     * chatへ登録
     */
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
      
      db.collection('logs')
        .insertOne(record, (error, ack) => {
          if (error) {
            console.error(error);
            return false;
          }
        });
  
      let avatarCriteria = {
        scenarioId: {$eq: scenarioId},
        alias     : {$eq: container.alias},
        state     : {$eq: container.state},
      };
  
      /*
       * alias-stateがマッチするレコードがある場合、dispを切り替える
       */
      db.collection('avatar')
        .find(avatarCriteria)
        .toArray((error, docs) => {
          assert.equal(null, error);
      
          if (docs.length !== 1) {
            return false;
          }
  
          if (docs[0].disp === true) {
            return false;
          }
      
          let avatarUpdateCriteria = {
            scenarioId: {$eq: scenarioId},
            alias     : {$eq: container.alias},
          };
          db.collection('avatar')
            .updateMany(avatarUpdateCriteria, {$set: {disp: false}}, (error, ack) => {
              assert.equal(null, error);
          
              db.collection('avatar')
                .updateOne(avatarCriteria, {$set: {disp: true}}, (error, ack) => {
                  assert.equal(null, error);
              
                  chatSocket.to(scenarioId)
                    .emit('reloadAvatars', {from: null, scenarioId: scenarioId})
                })
            })
        })
    });
    
  });
  
  /*
   * エイリアス名変更イベントを受け取った時
   */
  clientSocket.on('changeAlias', (data) => {
    data.msg = `一時エイリアスを追加。 「${data.newAlias}」`;
    console.log(` --> changeAlias => ${data.msg}`); // @DELETEME
    
    let recordAlias = {
      socketId  : clientSocket.id,
      scenarioId: scenarioId,
      alias     : data.newAlias,
    };
    
    let recordChat = {
      socketId  : clientSocket.id,
      scenarioId: scenarioId,
      alias     : data.alias,
      text      : data.msg
    };
    
    /*
     * aliasへエイリアスを登録、chatへ変更履歴を保存
     */
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
      
      let updateCriteria = {socketId: clientSocket.id};
      db.collection('alias')
        .updateOne(updateCriteria, recordAlias, {upsert: true}, (error, ack) => {
          if (error) {
            console.error(error);
            return false;
          }
          db.collection('logs')
            .insertOne(recordChat, (error, ack) => {
              if (error) {
                console.error(error);
                return false;
              }
              chatSocket.to(scenarioId)
                .emit('changeAlias', recordChat);
            });
        });
    });
    
  });
  
  /*
   * キャラクター表の更新リクエスト
   */
  clientSocket.on('reloadCharacters', (data) => {
    console.log(` --> reloadCharacters:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('reloadCharacters', data)
  });
  
  /*
   * 新規ボードをDBに登録した際のDOM作成リクエスト
   */
  clientSocket.on('deployBoards', (data) => {
    console.log(` --> deployBoards:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('deployBoards', data);
  });
  
  /*
   * ボードをDBから削除した際のDOM削除リクエスト
   */
  clientSocket.on('destroyBoards', (data) => {
    console.log(` --> destroyBoards:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('destroyBoards', data);
  });
  
  /*
   * ボードの画像を差し替えた際の読み込みリクエスト
   */
  clientSocket.on('attachBoardImage', (data) => {
    console.log(` --> attachBoardImage:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('attachBoardImage', data);
  });
  
  /*
   * 新規コマをDBへ登録した際のDOM作成リクエスト
   */
  clientSocket.on('deployPawns', (data) => {
    console.log(` --> deployPawns:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('deployPawns', data);
  });
  
  /*
   * コマの画像を差し替えた際の読み込みリクエスト
   */
  clientSocket.on('attachPawnImage', (data) => {
    console.log(` --> attachPawnImage:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('attachPawnImage', data);
  });
  
  /*
   * アバター設定を更新した時の更新リクエスト
   */
  clientSocket.on('reloadAvatars',(data)=>{
    console.log(` --> reloadAvatars:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('reloadAvatars', data);
  });
  
  /*
   * コマの移動をした際のリクエスト
   */
  clientSocket.on('movePawns', (data) => {
    console.log(` --> movePawns:${JSON.stringify(data)}`);
    mc.connect(mongoPath, (error, db) => {
      assert.equal(error, null);
      /*
       * criteriaを構成する要素は全て必須
       */
      let criteria   = {
        scenarioId : {$eq: data.scenarioId},
        boardId    : {$eq: data.boardId},
        characterId: {$eq: data.characterId},
        dogTag     : {$eq: data.dogTag}
      };
      let projection = {_id: 1, meta: 1};
      
      let top  = data.axis.top;
      let left = data.axis.left;
      
      db.collection('pawns')
        .find(criteria, projection)
        .toArray((error, doc) => {
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
          
          let updateCriteria  = {_id: {$eq: _id}};
          let updateOperation = {$set: {meta: meta}};
          
          db.collection('pawns')
            .updateOne(updateCriteria, updateOperation, {upsert: true}, (error, ack) => {
              if (error) {
                console.error(error);
                return false;
              }
              chatSocket.to(data.scenarioId)
                .emit('movePawns', data);
            });
        })
    })
  });
  
  /*
   * コマをDBから削除した際のDOM削除リクエスト
   */
  clientSocket.on('destroyPawns', (data) => {
    console.log(` --> destroyPawns:${JSON.stringify(data)}`);
    chatSocket.to(data.scenarioId).emit('destroyPawns', data);
  });
  
  /*
   * 切断時の処理
   */
  clientSocket.on('disconnect', () => {
    console.info(` --> disconnected: ${clientSocket.id}`);
    
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
      
      /*
       * 接続情報から削除
       */
      db.collection('users')
        .findOneAndDelete({socketId: {$eq: clientSocket.id}}, (error, ack) => {
          if (error) {
            console.error(error);
            return false;
          }
          
          chatSocket.to(scenarioId)
            .emit('logOut', clientSocket.id);
        })
    });
    
  });
});

module.exports = chatSocket;
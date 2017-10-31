/*
 * wwwから呼び出すモジュール
 * サーバサイドで稼働する
 */
let app          = require('../app');
let http         = require('http');
let server       = http.createServer(app);
let io           = require('socket.io')();
let serverSocket = io.listen(server);
let mc           = require('mongodb').MongoClient;
let ObjectId     = require('mongodb').ObjectId;
let assert       = require('assert');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

let scenarioId = undefined;

serverSocket.on('connection', (clientSocket) => {
  console.info(` --> ${clientSocket.id} connected to mabo.`); // @DELETEME
  
  /*
   * usersコレクションのドキュメントを、接続中のソケットIDのものを残して全て削除する。
   */
  refreshConnects.call(this);
  
  /*
   * シナリオIDとパスフレーズにより認証を行い、認証に成功すればusersコレクションに登録する
   */
  clientSocket.on('joinAsPlayer', joinAsPlayer.bind(this));
  
  /*
   * チャットステータスイベントを受け取った時
   */
  clientSocket.on('onType', onType.bind(this));
  
  /*
   * チャット発言を受け取った時。
   */
  clientSocket.on('chatMessage', chatMessage.bind(this));
  
  /*
   * ユーザ名の変更通知
   */
  clientSocket.on('changeUserName', changeUserName.bind(this));
  
  /*
   * 発言者変更イベントを受け取った時
   */
  clientSocket.on('changeSpeaker', changeSpeaker.bind(this));
  
  /*
   * キャラクター表の更新リクエスト
   */
  clientSocket.on('reloadCharacters', reloadCharacters.bind(this));
  
  /*
   * 新規ボードをDBに登録した際のDOM作成リクエスト
   */
  clientSocket.on('deployBoards', deployBoards.bind(this));
  
  /*
   * ボードをDBから削除した際のDOM削除リクエスト
   */
  clientSocket.on('destroyBoards', destroyBoards.bind(this));
  
  /*
   * ボードの画像を差し替えた際の読み込みリクエスト
   */
  clientSocket.on('attachBoardImage', attachBoardImage.bind(this));
  
  /*
   * 新規コマをDBへ登録した際のDOM作成リクエスト
   */
  clientSocket.on('deployPawns', deployPawns.bind(this));
  
  /*
   * コマの画像を差し替えた際の読み込みリクエスト
   */
  clientSocket.on('attachPawnImage', attachPawnImage.bind(this));
  
  /*
   * 立ち絵設定を更新した時の更新リクエスト
   */
  clientSocket.on('reloadAvatars', reloadAvatars.bind(this));
  
  /*
   * コマの移動をした際のリクエスト
   */
  clientSocket.on('movePawns', movePawns.bind(this));
  
  /*
   * コマをDBから削除した際のDOM削除リクエスト
   */
  clientSocket.on('destroyPawns', destroyPawns.bind(this));
  
  /*
   * 切断時の処理
   */
  clientSocket.on('disconnect', disconnect.bind(this));
  
  function refreshConnects() {
    /*
     * 現在接続中の、他シナリオ含め全接続を取得
     */
    let connected = Object.keys(serverSocket.eio.clients);
    console.log(`\u001b[33m`); // yellow
    connected.forEach((c) => {
      console.log(`connected: ${c}`);
    });
    console.log(`\u001b[0m`); // reset
    
    /*
     * 現在接続中でないソケットIDのレコードを全て削除
     */
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
      let deleteCriteria = {socketId: {$nin: connected}};
      db.collection('users').deleteMany(deleteCriteria, (error, ack) => {
        assert.equal(null, error);
      });
    });
  }
  
  function joinAsPlayer(container) {
    mc.connect(mongoPath, (error, db) => {
      assert.equal(error, null);
      
      scenarioId = container.scenarioId;
      
      if (typeof container.scenarioId !== 'string') {
        console.log(` --> invalid pass-phrase: ${container.passPhrase}`); // @DELETEME
        serverSocket.to(clientSocket.id).emit('joinFailed', {msg: 'パスフレーズは文字列で指定してください。'});
        return false;
      }
      
      let criteria = {_id: {$eq: ObjectId(container.scenarioId)}};
      db.collection('scenarios')
        .find(criteria)
        .toArray((error, scenarios) => {
          /*
           * シナリオの存在確認
           */
          if (scenarios.length === 0) {
            console.log(` --> scenario does not exist: ${scenarios._id}`);
            serverSocket.to(clientSocket.id).emit('joinFailed', {msg: '存在しないシナリオIDです。'});
            return false;
          }
          
          /*
           * パスフレーズのチェック
           */
          let scenario = scenarios[0];
          if (scenario.passPhrase !== container.passPhrase) {
            console.log(` --> invalid pass-phrase: ${container.passPhrase}`); // @DELETEME
            serverSocket.to(clientSocket.id).emit('joinFailed', {msg: 'パスフレーズが異なります。'});
            return false;
          }
          
          let criteria = {
            socketId  : {$eq: clientSocket.id},
            scenarioId: {$eq: container.scenarioId},
          };
          let name     = (container.hasOwnProperty('name')) ? container.name : clientSocket.id;
          
          let operation = {
            $set: {
              socketId  : clientSocket.id,
              scenarioId: container.scenarioId,
              name      : name,
              type      : 'player',
            }
          };

          /*
           * ログイン処理。ログイン済みの場合は上書き。
           */
          db.collection('users').updateOne(criteria, operation, {upsert: true}, (error, ack) => {
            if (error) {
              console.log(`\u001b[31m`); // red
              serverSocket.to(clientSocket.id).emit('joinFailed', {msg: 'システムエラー'});
              console.error(error); // @DELETEME
              console.log(`\u001b[0m`); // reset
              return false;
            }
  
            db.collection('users')
              .find({scenarioId: {$eq: scenarioId}}, {_id: 0})
              .toArray((error, users) => {
                assert.equal(error, null);
      
                serverSocket.to(clientSocket.id).emit('joinedAsPlayer', {
                  scenarioId  : container.scenarioId,
                  scenarioName: scenario.name,
                  users       : users
                });
      
                /*
                 * ログインしてきたソケットをシナリオIDのルームへ登録
                 */
                clientSocket.join(container.scenarioId, () => {
                  console.log(`\u001b[36m`); // cyan
                  console.log(`Join: ${clientSocket.id} to "${scenario.name}"`); // @DELETEME
                  console.log(`\u001b[0m`); // reset
                  serverSocket.to(container.scenarioId).emit('joinNotify', {
                    socketId: clientSocket.id,
                    users   : users
                  });
                });
              })
          })
        })
    })
  }
  
  function onType(container) {
    console.log(` --> onType => ${container.speaker}: ${container.status}`);
    serverSocket.to(scenarioId).emit('onType', container);
  }
  
  function chatMessage(container) {
    console.log(` --> chatMessage => [${container.channel}] ${container.speaker}##${container.state}: ${container.text}`);
    let record = {
      scenarioId: scenarioId,
      socketId  : clientSocket.id,
      speaker   : container.speaker,
      state     : container.state || undefined,
      text      : container.text,
      channel   : container.channel,
      postscript: container.postscript,
    };
  
    serverSocket.to(scenarioId).emit('chatMessage', record);
    
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
        speaker   : {$eq: container.speaker},
        state     : {$eq: container.state},
      };
  
      /*
       * speaker-stateがマッチするレコードがある場合、dispを切り替える
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
            speaker   : {$eq: container.speaker},
          };
          db.collection('avatar')
            .updateMany(avatarUpdateCriteria, {$set: {disp: false}}, (error, ack) => {
              assert.equal(null, error);
  
              db.collection('avatar')
                .updateOne(avatarCriteria, {$set: {disp: true}}, (error, ack) => {
                  assert.equal(null, error);
  
                  serverSocket.to(scenarioId)
                    .emit('reloadAvatars', {from: null, scenarioId: scenarioId})
                })
            })
        })
    });
  }
  
  function changeUserName(container) {
    let newName            = container.userName;
    let changeNameCriteria = {
      socketId  : {$eq: clientSocket.id},
      scenarioId: {$eq: scenarioId},
    };
    let operation          = {$set: {name: newName}}
    
    mc.connect(mongoPath, (error, db) => {
      assert.equal(error, null);
      db.collection('users')
        .findOneAndUpdate(changeNameCriteria, operation, (error, ack) => {
          assert.equal(error, null);
          console.log(` --> changeUserName: ${clientSocket.id} = ${newName}`);
          
          let criteria = {
            scenarioId: {$eq: scenarioId},
          }
          db.collection('users')
            .find(criteria, {_id: 0})
            .toArray((error, users) => {
              assert.equal(error, null);
              serverSocket.to(scenarioId).emit('userNameChanged', {newName: newName, users: users});
            })
        })
    })
  }
  
  function changeSpeaker(data) {
    data.msg = `一時発言者を追加。 「${data.newSpeaker}」`;
    console.log(` --> changeSpeaker => ${data.msg}`); // @DELETEME
    
    let recordChat = {
      socketId  : clientSocket.id,
      scenarioId: scenarioId,
      speaker     : data.speaker,
      text      : data.msg
    };
    
    /*
     * chatへ変更履歴を保存
     */
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
  
      db.collection('logs')
        .insertOne(recordChat, (error, ack) => {
          assert.equal(error, null);
          serverSocket.to(scenarioId).emit('changeSpeaker', recordChat);
        });
    });
  }
  
  function reloadCharacters(data) {
    console.log(` --> reloadCharacters:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('reloadCharacters', data)
  }
  
  function deployBoards(data) {
    console.log(` --> deployBoards:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('deployBoards', data);
  }
  
  function destroyBoards(data) {
    console.log(` --> destroyBoards:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('destroyBoards', data);
  }
  
  function attachBoardImage(data) {
    console.log(` --> attachBoardImage:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('attachBoardImage', data);
  }
  
  function deployPawns(data) {
    console.log(` --> deployPawns:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('deployPawns', data);
  }
  
  function attachPawnImage(data) {
    console.log(` --> attachPawnImage:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('attachPawnImage', data);
  }
  
  function reloadAvatars(data) {
    console.log(` --> reloadAvatars:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('reloadAvatars', data);
  }
  
  function movePawns(data) {
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
              serverSocket.to(data.scenarioId).emit('movePawns', data);
            });
        })
    })
  }
  
  function destroyPawns(data) {
    console.log(` --> destroyPawns:${JSON.stringify(data)}`);
    serverSocket.to(data.scenarioId).emit('destroyPawns', data);
  }
  
  function disconnect() {
    console.info(` --> disconnected: ${clientSocket.id}`);
    
    mc.connect(mongoPath, (error, db) => {
      assert.equal(null, error);
      
      /*
       * 接続情報から削除
       */
      db.collection('users').findOneAndDelete({socketId: {$eq: clientSocket.id}}, (error, ack) => {
        assert.equal(error, null);
  
        db.collection('users')
          .find({scenarioId: {$eq: scenarioId}}, {_id: 0})
          .toArray((error, users) => {
            assert.equal(error, null);
            serverSocket.to(scenarioId).emit('logOut', {leftId: clientSocket.id, users: users});
          });
      });
    });
    
  }
});

module.exports = serverSocket;
let express   = require('express');
let router    = express.Router();
let mc        = require('mongodb').MongoClient;
let ObjectId  = require('mongodb').ObjectID;
let assert    = require('assert');
let timestamp = require('../mabo_modules/timestamp');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

/*
 * 画面API
 */
router.get('/list', function(req, res, next) {
  /*
   * シナリオ一覧画面
   */
  res.render('scenarios/list', {title: 'シナリオ一覧'});
});

router.get('/:scenarioId', function(req, res, next) {
  /*
   * シナリオプレイ画面
   */
  let scenarioId = new ObjectId(req.params.scenarioId);
  
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    db.collection('scenarios').find({_id: {$eq: scenarioId}}, {name: 1})
      .toArray(function(error, doc) {
        
        /*
         * シナリオ名取得
         */
        if (doc.length === 0) {
          /*
           * シナリオが存在しない場合、もしくはクローズ済みの場合はシナリオ一覧へリダイレクト
           */
          console.log(`scenarioId: ${scenarioId} does not exist.`);
          res.redirect('./list');
          return
        }
        res.render('scenarios/theater', {
          title     : `『${doc[0].name}』`,
          scenarioId: req.params.scenarioId
        })
      })
  });
});

/*
 * Ajaxで叩く用
 */
router.get('', function(req, res, next) {
  
  /*
   * シナリオ一覧取得
   */
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    /*
     * シナリオID、シナリオ名、概要を取得
     */
    db.collection('scenarios')
      .find({closed: false}, {_id: 1, name: 1, synopsis: 1})
      .toArray(function(error, scenarios) {
        /*
         * speakerコレクションの件数を参照して接続人数を取得
         */
        db.collection('users')
          .find({}, {scenarioId: 1})
          .toArray((error, speaker) => {
            let session = scenarios.map((v) => {
              v.sessionCount = speaker.filter((x) => {
                return x.scenarioId === v._id.toString();
              }).length;
              v.timestamp    = v._id.getTimestamp();
              v._id          = v._id.toString();
              
              return v;
            }).sort(function(a, b) {
              return (a.timestamp < b.timestamp) ? 1 : -1
            });
            res.status(200);
            res.send(session);
            return false;
          });
      });
  });
});

router.post('', function(req, res, next) {
  
  let name       = req.body.scenarioName;
  let passPhrase = req.body.passPhrase;
  let synopsis   = req.body.synopsis;
  
  let error = validateScenarioInfo(name, passPhrase, synopsis);
  
  if (error) {
    res.status(422);
    res.send('シナリオの登録内容にエラーがあったようです。');
    return false;
  }
  
  /*
   * シナリオの作成
   */
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    let document = {
      name      : name,
      passPhrase: passPhrase,
      synopsis  : synopsis,
      closed    : false
    };
    
    db.collection('scenarios').insertOne(document, function(error, db) {
      if (error) {
        res.status(500);
        res.send('シナリオの作成に失敗しました。')
      }
      res.status(200);
      res.send();
    })
  })
  
});

router.patch('', function(req, res, next) {
  
  /*
   * シナリオ設定内容変更用のエンドポイント
   */
  let scenarioId = new ObjectId(req.body.scenarioId);
  let name       = req.body.scenarioName;
  let passPhrase = req.body.passPhrase;
  let synopsis   = req.body.synopsis;
  let error      = validateScenarioInfo(name, passPhrase, synopsis);
  
  if (error) {
    res.status(422);
    res.send('シナリオの登録内容にエラーがあったようです。');
    return false;
  }
  
  mc.connect(mongoPath, function(error, db) {
    assert.equal(error, null);
    
    db.collection('scenarios').find({_id: {$eq: scenarioId}})
      .toArray(function(error, doc) {
        /*
         * パスフレーズ検証
         */
        if (doc[0].passPhrase !== passPhrase) {
          res.status(400);
          res.send('パスフレーズが違います。');
          return false;
        }
        
        let document = {
          _id       : scenarioId,
          name      : name,
          passPhrase: passPhrase,
          synopsis  : synopsis,
          closed    : false
        };
        db.collection('scenarios')
          .updateOne({_id: {$eq: scenarioId}}, document, {upsert: true}, function(error) {
            if (error) {
              res.status(500);
              res.send('シナリオ設定に失敗しました。');
              return false;
            } else {
              res.status(200);
              res.send();
              return false;
            }
          })
      })
  });
});

router.patch('/close', function(req, res, next) {
  
  /*
   * シナリオのクローズ(論理削除)
   */
  let scenarioId = new ObjectId(req.body.scenarioId);
  let passPhrase = req.body.passPhrase;
  
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    db.collection('scenarios')
      .find({_id: scenarioId}, {_id: 1, passPhrase: 1})
      .toArray(function(error, doc) {
        if (doc.length === 0) {
          res.status(204);
          res.send('クローズを試みましたが、該当するシナリオがありませんでした。');
          return false;
        }
        if (doc[0].passPhrase !== passPhrase) {
          res.status(400);
          res.send('パスフレーズが違います。');
          return false;
        }
        db.collection('scenarios').updateOne({_id: scenarioId}, {$set: {closed: true}}, function(error, db) {
          if (error) {
            res.status(500);
            res.send('シナリオのクローズに失敗しました。');
            return false;
          } else {
            res.status(204);
            res.send();
            return false;
          }
        });
      });
  });
});

function validateScenarioInfo(name, passPhrase, synopsis) {
  /*
   * HTMLエンコードで文字数が膨らむため、厳密な文字数バリデーションは行わない
   */
  let err = false;
  err     = err || (typeof name !== 'string' || name === '' || name.length > 100);
  err     = err || (typeof passPhrase !== 'string' || passPhrase === '' || passPhrase.length > 100);
  err     = err || (typeof synopsis !== 'string' || synopsis.length > 2000);
  return err;
}

module.exports = router;

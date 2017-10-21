"use strict";
/*
 * キャラクタのパラメタを扱う
 */
let express = require('express');
let router  = express.Router();
let mc      = require('mongodb').MongoClient;
let assert  = require('assert');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

router.get('/:scenarioId([0-9a-f]+)', function(req, res, next) {
  let scenarioId = req.params.scenarioId;
  
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    db.collection('character')
      .find({scenarioId: {$eq: scenarioId}}, {_id: 0, scenarioId: 0})
      .toArray(function(error, docs) {
        res.send(docs);
      });
    db.close();
  })
});

router.patch('/:scenarioId([0-9a-f]+)', function(req, res, next) {
  /*
   * シナリオIDとテーブルデータを指定してキャラクターデータを更新する。
   */
  let scenarioId = req.body.scenarioId;
  let data       = req.body.data;
  
  // scenarioIdを追加して登録用のデータへ整形
  let records = data.map(function(v) {
    if (!v.hasOwnProperty('scenarioId')) {
      v.scenarioId = scenarioId;
    }
    return v;
  });
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    db.collection('character')
      .deleteMany({scenarioId: {$eq: scenarioId}}, function(error, result) {
        assert.equal(null, error);
        console.log('  delete documents in \'character\'!');
        db.collection('character')
          .insertMany(records, function(error, result) {
            assert.equal(null, error);
            console.log('  insert documents into \'character\'!');
            console.log(records);
            res.send();
            db.close();
          });
      });
  })
});

module.exports = router;

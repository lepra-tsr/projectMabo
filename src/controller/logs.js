/*
 * チャット内容を読み出す
 */
let express = require('express');
let router  = express.Router();
let mc      = require('mongodb').MongoClient;
let assert  = require('assert');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

router.get('', function(req, res, next) {
  
  let scenarioId = req.query.scenarioId;
  let criteria   = {};
  if (scenarioId) {
    criteria.scenarioId     = {};
    criteria.scenarioId.$eq = scenarioId;
  }
  mc.connect(mongoPath, function(error, db) {
    assert.equal(error, null);
    db.collection('logs')
      .find(criteria, {_id: 0})
      .toArray(function(error, docs) {
        res.send(docs);
      })
  })
});

router.get('/channels', function(req, res, next) {
  
  let scenarioId = req.query.scenarioId;
  if (typeof scenarioId === 'undefined') {
    res.status(400);
    res.send('scenarioIdの指定方法が不正です。')
  }
  
  let criteria = {};
  if (scenarioId) {
    criteria.scenarioId      = {};
    criteria.scenarioId.$eq  = scenarioId;
    criteria.channel         = {};
    criteria.channel.$exists = true;
  }
  
  mc.connect(mongoPath, function(error, db) {
    assert.equal(null, error);
    db.collection('logs')
      .find(criteria, {_id: 0, channel: 1})
      .toArray(function(error, docs) {
        assert.equal(null, error);
        
        /*
         * 重複を削除
         */
        let channels = docs.map((v) => {
          return (v.channel) ? v.channel.trim() : '';
        }).filter((v, i, a) => {
          return v !== '' && a.indexOf(v) === i;
        }).sort((x, y) => {
          return x > y;
        });
        
        res.send(channels);
      });
  })
});

module.exports = router;

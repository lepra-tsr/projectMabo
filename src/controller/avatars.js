"use strict";
/*
 * 立ち絵設定
 */
let express = require('express');
let router  = express.Router();
let mc      = require('mongodb').MongoClient;
let assert  = require('assert');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

/**
 * アバター設定の取得
 */
router.get('', (req, res, next) => {
  
  let scenarioId = req.query.scenarioId;
  
  if (typeof scenarioId === 'undefined') {
    res.status(400);
    res.send()
  }
  
  let criteria        = {};
  criteria.scenarioId = {$eq: scenarioId};
  
  mc.connect(mongoPath, (error, db) => {
    db.collection('avatar')
      .find(criteria)
      .sort('alias',1)
      .toArray((error, docs) => {
        res.send(docs);
      });
  });
});

router.put('', (req, res, next) => {
  let config     = req.body.config || [];
  let scenarioId = req.body.scenarioId;
  
  if (typeof scenarioId === 'undefined') {
    res.status(400);
    res.send();
  }
  
  let documents = config.map((v) => {
    v.scenarioId = scenarioId;
    v.disp       = v.disp === 'true' || v.disp === true;
    v.position   = parseInt(v.position);
    delete v._id;
    return v;
  });
  
  mc.connect(mongoPath, (error, db) => {
    if (error) {
      console.error(error);
      return false;
    }
    
    db.collection('avatar').deleteMany({scenarioId: {$eq: scenarioId}}, (error, ack) => {
      if (error) {
        console.error(error);
      }
      if(config.length ===0){
        /*
         * 挿入するレコードがない場合
         */
        res.status(204);
        res.send();
        return false;
      }
      
      db.collection('avatar').insert(documents, (error, ack) => {
        if (error) {
          console.error(error);
        }
        res.send(ack.ops);
        return false;
      })
    })
  });
});

module.exports = router;



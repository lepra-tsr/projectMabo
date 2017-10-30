let express  = require('express');
let router   = express.Router();
let mc       = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;
let assert   = require('assert');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

router.get('/', function(req, res, next) {
  res.render('index', {title: 'Mabo', scenarioId: '', scenarioName: ''});
});

router.get('/mabo', function(req, res, next) {
  res.render('index', {title: 'Mabo', scenarioId: '', scenarioName: ''});
});

router.get('/mabo/:scenarioId', function(req, res, next) {
  let scenarioId    = req.params.scenarioId;
  let validObjectId = /^[a-f0-9]{24}$/i.test(scenarioId);
  
  if (!validObjectId) {
    console.log('invalid scenarioId.'); // @DELETEME
    res.render('index', {title: 'Mabo', scenarioId: ''});
    return false;
  }
  
  /*
   * 存在するシナリオIDかチェックする
   */
  mc.connect(mongoPath, (error, db) => {
    assert.equal(error);
    
    db.collection('scenarios').find({_id: {$eq: ObjectId(scenarioId)}})
      .toArray((error, docs) => {
        assert.equal(error);
        
        if (docs.length !== 0) {
          res.render('index', {title: docs[0].name, scenarioId: scenarioId});
          return false;
        }
        
        console.log('invalid scenarioId.'); // @DELETEME
        res.render('index', {title: 'Mabo', scenarioId: ''});
        return false;
      })
  });
});

module.exports = router;
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
    
    let criteria = {};
    if (scenarioId) {
        criteria.scenarioId     = {};
        criteria.scenarioId.$eq = scenarioId;
    }
    mc.connect(mongoPath, function(error, db) {
        assert.equal(error, null);
        db.collection('logs')
            .find(criteria, {_id: 0})
            .toArray(function(error, docs) {
                console.log(docs); // @DELETEME
                res.send(docs);
            })
    })
});

module.exports = router;

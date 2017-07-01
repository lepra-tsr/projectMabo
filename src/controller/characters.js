/*
 * キャラクタのパラメタを扱う
 */
let express     = require('express');
let router      = express.Router();
let mc          = require('mongodb').MongoClient;
let assert      = require('assert');
let def         = require('../mabo_modules/def');
const mongoPath = def.mongoPath;

router.get('/:id([0-9a-f]+)', function(req, res, next) {
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        db.collection('character')
            .find({_scenarioId: {$eq: parseInt(req.params.id, 10)}}, {_id: 0, _scenarioId: 0})
            .toArray(function(error, docs) {
                res.send(docs);
            });
        db.close();
    })
});

router.patch('/:id([0-9a-f]+)', function(req, res, next) {
    /*
     * シナリオIDとテーブルデータを指定してキャラクターデータを更新する。
     */
    var _scenarioId = req.body._scenarioId;
    var data        = req.body.data;
    
    // _scenarioIdを追加して登録用のデータへ整形
    var records = data.map(function(v) {
        if (!v.hasOwnProperty('_scenarioId')) {
            v._scenarioId = parseInt(_scenarioId, 10);
        }
        return v;
    });
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        db.collection('character')
            .deleteMany({_scenarioId: {$eq: parseInt(_scenarioId, 10)}}, function(error, result) {
                assert.equal(null,error);
                console.log('  delete documents in \'character\'!');
                db.collection('character')
                    .insertMany(records, function(error,result) {
                        assert.equal(null,error);
                        console.log('  insert documents into \'character\'!');
                        console.log(records);
                        res.send();
                        db.close();
                    });
            });
    })
});

module.exports = router;

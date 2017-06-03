/*
 * キャラクタのパラメタを扱う
 */
var express   = require('express');
var router    = express.Router();
var mc        = require('mongodb').MongoClient;
var assert    = require('assert');
var mongoPath = 'mongodb://localhost:27017/test';

/*
 * 部屋番号を指定してキャラクタ情報を取得
 * ルームオブジェクトもまとめて格納する？
 */
router.get('/:id(\\d+)', function(req, res, next) {
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        db.collection('character')
            .find({_roomId: {$eq: parseInt(req.params.id, 10)}}, {_id: 0, _roomId: 0})
            .toArray(function(error, docs) {
                res.send(docs);
            });
        db.close();
    })
});

/*
 * 部屋番号とテーブルデータを指定してキャラクターデータを更新する。
 */
router.patch('/:id(\\d+)', function(req, res, next) {

    var data    = req.body.data;
    var _roomId  = req.body._roomId;

    // _roomIdを追加して登録用のデータへ整形
    var records = data.map(function(v) {
        if (!v.hasOwnProperty('_roomId')) {
            v._roomId = parseInt(_roomId,10);
        }
        return v;
    });
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        db.collection('character')
            .deleteMany({_roomId: {$eq: parseInt(_roomId, 10)}}, function(error,result) {
                assert.equal(null,error);
                console.log('  delete documents in \'character\'!');
                db.collection('character')
                    .insertMany(records, function(error,result) {
                        assert.equal(null,error);
                        console.log('  insert documents into \'character\'!');
                        console.log(records);
                        res.send();
                        db.close();
                        /*
                         * 変更をbroadcastで通知
                         */
                    });
            });
    })
});

module.exports = router;

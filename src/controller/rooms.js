let express     = require('express');
let router      = express.Router();
let mc          = require('mongodb').MongoClient;
let ObjectId    = require('mongodb').ObjectID;
let assert      = require('assert');
let timestamp   = require('../mabo_modules/timestamp');
let fs          = require('fs');
let def         = require('../mabo_modules/def');
const mongoPath = def.mongoPath;


router.get('', function(req, res, next) {
    
    /*
     * シナリオ一覧画面
     */
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        /*
         * ルームID、シナリオ名、概要を取得
         */
        db.collection('rooms')
            .find({closed: false}, {_id: 1, name: 1, synopsis: 1})
            .toArray(function(error, rooms) {
                /*
                 * aliasコレクションの件数を参照して接続人数を取得
                 */
                db.collection('alias')
                    .find({
                        roomId: {
                            $in: rooms.map(function(v) {
                                return v._id.toString();
                            })
                        }
                    }, {roomId: 1})
                    .toArray(function(error, alias) {
                        let session = rooms.map(function(v) {
                            v.sessionCount = alias.filter(function(x) {
                                return x.roomId === v._id.toString();
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

router.patch('/close', function(req, res, next) {
    
    /*
     * 部屋の論理削除
     */
    let roomId     = new ObjectId(req.body.roomId);
    let passPhrase = req.body.passPhrase;
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        db.collection('rooms')
            .find({_id: roomId}, {_id: 1, passPhrase: 1})
            .toArray(function(error, doc) {
                if (doc.length === 0) {
                    res.status(204);
                    res.send('クローズを試みましたが、該当するルームがありませんでした。');
                    return false;
                }
                if (doc[0].passPhrase !== passPhrase) {
                    res.status(400);
                    res.send('パスフレーズが違います。');
                    return false;
                }
                db.collection('rooms').updateOne({_id: roomId}, {$set: {closed: true}}, function(error, db) {
                    if (error) {
                        res.status(500);
                        res.send('ルームのクローズに失敗しました。');
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

router.patch('', function(req, res, next) {
    
    /*
     * ルーム設定内容変更用のエンドポイント
     */
    let roomId     = new ObjectId(req.body.roomId);
    let name       = req.body.scenarioName;
    let passPhrase = req.body.passPhrase;
    let synopsis   = req.body.synopsis;
    let error      = validateScenarioInfo(name, passPhrase, synopsis);
    
    if (error) {
        res.status(422);
        res.send('ルームの登録内容にエラーがあったようです。');
        return false;
    }
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(error, null);
        
        db.collection('rooms').find({_id: {$eq: roomId}})
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
                    _id       : roomId,
                    name      : name,
                    passPhrase: passPhrase,
                    synopsis  : synopsis,
                    closed    : false
                };
                db.collection('rooms')
                    .updateOne({_id: {$eq: roomId}}, document, {upsert: true}, function(error) {
                        if (error) {
                            res.status(500);
                            res.send('ルーム設定に失敗しました。');
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

router.post('', function(req, res, next) {
    
    let name       = req.body.scenarioName;
    let passPhrase = req.body.passPhrase;
    let synopsis   = req.body.synopsis;
    
    let error = validateScenarioInfo(name, passPhrase, synopsis);
    
    if (error) {
        res.status(422);
        res.send('ルームの登録内容にエラーがあったようです。');
        return false;
    }
    
    /*
     * 部屋の作成
     */
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        let document = {
            name      : name,
            passPhrase: passPhrase,
            synopsis  : synopsis,
            closed    : false
        };
        
        db.collection('rooms').insertOne(document, function(error, db) {
            if (error) {
                res.status(500);
                res.send('ルームの作成に失敗しました。')
            }
            res.status(200);
            res.send();
        })
    })
    
});

router.get('/list', function(req, res, next) {
    
    /*
     * シナリオ一覧画面
     */
    res.render('rooms/list', {title: 'ルーム一覧'});
});


module.exports = router;

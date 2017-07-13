/*
 * playGroundに設置したboard、pawnを管理する
 */
let express     = require('express');
let router      = express.Router();
let mc          = require('mongodb').MongoClient;
let assert      = require('assert');
let ObjectId    = require('mongodb').ObjectID;

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

router.get('', function(req, res, next) {
    /*
     * シナリオに紐づくボードを取得する。
     * ボードIDを指定した場合はそのIDのボードを取得する。
     * getAllフラグがtrueの場合は全て取得する。
     */
    
    let scenarioId = req.query.scenarioId;
    let getAll     = req.query.getAll === 'true';
    
    let criteria = {
        scenarioId: {$eq: scenarioId},
    };
    if (!getAll) {
        let boardId  = new ObjectId(req.query.boardId);
        criteria._id = {$eq: boardId};
    }
    console.info(JSON.stringify(criteria)); // @DELETEME
    
    /*
     * シナリオID、ボードIDから情報取得
     */
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
    
        db.collection('boards')
            .find(criteria)
            .toArray(function(error, doc) {
                assert.equal(error, null);
                doc.map(function(v) {
                    v._id = v._id.toString();
                });
                res.send(doc);
            });
    })
    
});

router.post('', function(req, res, next) {
    
    let scenarioId = req.body.scenarioId;
    let name       = req.body.name;
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        let doc = {
            scenarioId: scenarioId,
            name      : name
        };
    
        db.collection('boards')
            .insertOne(doc, function(error, ack) {
                assert.equal(error, null);
                /*
                 * 登録成功時は_idを文字列に変換して返却する
                 */
                res.status(201);
                res.send({boardId: ack.insertedId.toString()});
            });
        db.close();
    })
});


router.patch('', function(req, res, next) {
    /*
     * 位置情報の変更以外
     */
});

router.delete('', function(req, res, next) {
    let scenarioId = req.query.scenarioId;
    let boardId    = req.query.boardId;
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
    
        /*
         * boards, pawnsコレクションのcriteria
         */
        let criteriaBoards = {
            scenarioId: {$eq: scenarioId},
            _id       : {$eq: new ObjectId(boardId)}
        };
        let criteriaPawns  = {
            scenarioId: {$eq: scenarioId},
            boardId   : {$eq: boardId},
        };
    
        console.log(`    criteriaBoards:${JSON.stringify(criteriaBoards)}`);
        console.log(`    criteriaPawns:${JSON.stringify(criteriaPawns)}`);
    
        /*
         * ボードの削除
         */
        db.collection('boards')
            .deleteOne(criteriaBoards, function(error, ack) {
                let deleted = {
                    boards: ack.deletedCount
                };
                if (deleted.boards === 0) {
                    res.status(400);
                    res.send('存在しないボードは削除できません。');
                    return false;
                }
                /*
                 * 関連するコマを削除
                 */
                db.collection('pawns').deleteMany(criteriaPawns, function(error, ack) {
                    deleted.pawns = ack.deletedCount;
                    res.status(200);
                    res.send(deleted);
                });
            });
    });
});

module.exports = router;

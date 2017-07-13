/*
 * playGroundに設置したboard、pawnを管理する
 */
let express     = require('express');
let router      = express.Router();
let mc          = require('mongodb').MongoClient;
let assert      = require('assert');
let ObjectId    = require('mongodb').ObjectID;

require('dotEnv').config();

const mongoPath = process.env.MONGODB_PATH;

router.get('', function(req, res, next) {
    /*
     * キャラクターの駒をロードする
     */
    let pawnId      = req.query.pawnId;
    let scenarioId  = req.query.scenarioId;
    let boardId     = req.query.boardId;
    let characterId = req.query.characterId;
    let dogTag      = req.query.dogTag;
    
    let criteria = {};
    if (pawnId) {
        criteria._id     = {};
        criteria._id.$eq = new ObjectId(pawnId);
    } else {
        if (scenarioId) {
            criteria.scenarioId     = {};
            criteria.scenarioId.$eq = scenarioId;
        }
        if (boardId) {
            criteria.boardId     = {};
            criteria.boardId.$eq = boardId;
        }
        if (characterId) {
            criteria.characterId     = {};
            criteria.characterId.$eq = characterId;
        }
        if (dogTag) {
            criteria.dogTag     = {};
            criteria.dogTag.$eq = dogTag;
        }
    }
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        
        
        db.collection('pawns').find(criteria).toArray(function(error, doc) {
            assert.equal(null, error);
            res.status(200);
            res.send(doc);
            console.info(`  criteria: ${JSON.stringify(criteria)}`); // @DELETEME
            console.info(doc); // @DELETEME
        })
    })
    
});

router.post('', function(req, res, next) {
    /*
     * 駒(Pawn)を作成した際の処理。
     * 必須パラメータはシナリオID、ボードID、キャラクターID。
     * ドッグタグはAPI側で採番する。
     */
    let scenarioId  = req.body.scenarioId;
    let boardId     = req.body.boardId;
    let characterId = req.body.characterId;
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        let criteria = {
            scenarioId : {$eq: scenarioId},
            boardId    : {$eq: boardId},
            characterId: {$eq: characterId}
        };
        db.collection('pawns').find(criteria).toArray(function(error, docs) {
            /*
             * ドッグタグの採番
             */
            let dogTag = 1 + parseInt(
                    docs.reduce(function(a, b) {
                        return a.dogTag > b.dogTag ? a : b;
                    }, {dogTag: -1}).dogTag
                    , 10);
            
            let doc = {
                scenarioId : scenarioId,
                boardId    : boardId,
                characterId: characterId,
                dogTag     : dogTag.toString(),
            };
            db.collection('pawns').insertOne(doc, function(error, ack) {
                assert.equal(null, error);
                res.status(201);
                res.send({
                    pawnId     : ack.insertedId.toString(),
                    scenarioId : scenarioId,
                    boardId    : boardId,
                    characterId: characterId,
                    dogTag     : dogTag.toString()
                });
            });
            db.close();
        });
    });
});

router.delete('', function(req, res, next) {
    /*
     * コマを削除する。
     */
    let pawnId      = req.query.pawnId;
    let scenarioId  = req.query.scenarioId;
    let boardId     = req.query.boardId;
    let characterId = req.query.characterId;
    let dogTag      = req.query.dogTag;
    
    let criteria = {};
    if (pawnId) {
        criteria._id     = {};
        criteria._id.$eq = new ObjectId(pawnId);
    } else {
        if (scenarioId) {
            criteria.scenarioId     = {};
            criteria.scenarioId.$eq = scenarioId;
        }
        if (boardId) {
            criteria.boardId     = {};
            criteria.boardId.$eq = boardId;
        }
        if (characterId) {
            criteria.characterId     = {};
            criteria.characterId.$eq = characterId;
        }
        if (dogTag) {
            criteria.dogTag     = {};
            criteria.dogTag.$eq = dogTag;
        }
    }
    
    let display = {
        _id        : 1,
        scenarioId : 1,
        boardId    : 1,
        characterId: 1,
        dogTag     : 1
    };
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
    
        let result = [];
        db.collection('pawns').find(criteria, display).toArray((error, docs) => {
            if (docs.length !== 0) {
                docs.forEach(function(v) {
                    result.push(v);
                })
            }
            db.collection('pawns').deleteMany(criteria, function(error, ack) {
                assert.equal(null, error);
                res.status(200);
                res.send(result);
            })
        });
    })
});

module.exports = router;

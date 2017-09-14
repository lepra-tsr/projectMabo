let express   = require('express');
let router    = express.Router();
let mc        = require('mongodb').MongoClient;
let assert    = require('assert');
let timestamp = require('../mabo_modules/timestamp');
let fs        = require('fs');
let AWS       = require('aws-sdk');

require('dotenv').config();

const mongoPath = process.env.MONGODB_PATH;

const IMAGE_STORAGE             = process.env.IMAGE_STORAGE || 'local';
const IMAGE_PATH                = process.env.IMAGE_PATH;
const ACCESS_KEY_ID             = process.env.ACCESS_KEY_ID;
const AWS_SECRET_KEY            = process.env.AWS_SECRET_KEY;
const AMAZON_S3_HOSTNAME        = process.env.AMAZON_S3_HOSTNAME;
const AMAZON_S3_REGION          = process.env.AMAZON_S3_REGION;
const AMAZON_S3_IMAGE_BUCKET    = process.env.AMAZON_S3_IMAGE_BUCKET;
const AMAZON_S3_URI_EXPIRES_PUT = parseInt(process.env.AMAZON_S3_URI_EXPIRES_PUT);
const AMAZON_S3_URI_EXPIRES_GET = parseInt(process.env.AMAZON_S3_URI_EXPIRES_GET);


/*
 * Amazon S3の接続設定
 */
const s3Options = {
                accessKeyId    : ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_KEY,
                region         : AMAZON_S3_REGION
            };
AWS.config.update(s3Options);

/*
 * s3クライアントを生成
 */
const s3 = new AWS.S3();


router.get('/tags', function(req, res, next) {
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        db.collection('images')
            .find({}, {_id: 0, tags: 1})
            .toArray(function(error, docs) {
                
                let tagMap = {};
                
                /*
                 * ネストした配列を1次元配列へ変換し、タグ名と登場回数のマップにする
                 */
                docs.map(function(v) {
                    return v.tags
                }).join(',').split(',')
                    .forEach(function(v, i, a) {
                        if (v !== '') {
                            if (a.indexOf(v) === i) {
                                tagMap[v] = 1;
                            } else {
                                tagMap[v]++;
                            }
                        }
                    });
                console.log(tagMap);
                
                /*
                 * 連想配列へ変換してソート
                 */
                let tagAligned = Object.keys(tagMap).map(function(v) {
                    return {tagName: v, count: tagMap[v]}
                }).sort(function(a, b) {
                    return (a.count < b.count) ? 1 : -1
                }).map(function(v) {
                    return v.tagName
                });
                
                res.send(tagAligned);
            });
        db.close();
    })
});

/**
 * S3の一時認証URLを取得するのに必要なキーを取得する
 * 以下の条件で検索
 *   * タグ(複数指定可能)
 *       複数指定した場合、それぞれで完全一致検索してORで結合。
 *   * シナリオID
 *       完全一致。
 *   * パスフレーズ
 *       完全一致。
 *
 */
router.get('/keys', function(req, res, next) {
    let scenarioId = req.query.scenarioId;
    let tags       = req.query.tags;
    let passPhrase = req.query.passPhrase;
    
    let query = {}
    if (scenarioId) {
        query.scenarioId = {$eq: scenarioId};
    }
    if (tags) {
        query.tags = {$in: tags.trim().split(',')};
    }
    if (passPhrase) {
        if (typeof passPhrase === 'string' && passPhrase.trim().length !== 0) {
            query.passPhrase = {$eq: passPhrase};
        }
    }
    
    mc.connect(mongoPath, (error, db) => {
        assert.equal(null, error);
        db.collection('images')
            .find(query, {_id: 0, key: 1, contentType: 1})
            .toArray((error, doc) => {
                res.send(doc);
            })
    })
    
})

/**
 * Amazon S3へのGET、PUTの一時URIを発行する
 *
 * request: "putObject", "getObject"
 *   aws-sdk.S3のAPIの定数
 * key:
 *   クライアント側で生成する、S3上でのユニークなID
 * contentType:
 */
router.get('/signedURI/:request', function(req, res, next) {
    let request     = req.params.request || '';
    let key         = req.query.key.trim();
    let contentType = req.query.contentType || '';
    
    if (['getObject', 'putObject'].indexOf(request) === -1) {
        res.status(400);
        res.send('不正な操作要求です。');
        return false;
    }
    if (typeof key !== 'string' || key === '') {
        res.status(400);
        res.send('ファイル名が不正です。');
        return false;
    }
    
    if (typeof contentType !== 'string' || contentType === '') {
        res.status(400);
        res.send('contentTypeは必須項目です。');
        return false;
    }
    
    if (!contentType.test(/^image\//)) {
        res.status(400);
        res.send(`MIMEタイプ「${contentType}」から、画像と判定出来ませんでした。`);
        return false;
    }
    
    let params = {
        Bucket: AMAZON_S3_IMAGE_BUCKET,
        Key   : `${key}`,
    };
    
    /*
     * HTTPメソッド別に必要パラメータをセット
     */
    switch (request) {
        case 'getObject':
            params.Expires = AMAZON_S3_URI_EXPIRES_GET;
            break;
        case 'putObject':
            params.Expires     = AMAZON_S3_URI_EXPIRES_PUT;
            params.ContentType = contentType;
            break;
    }
    
    /*
     * 一時URIを取得して返却
     */
    s3.getSignedUrl(request, params, function(error, uri) {
        if (error) {
            res.status(500);
            console.log(error);
            res.send();
        }
        res.status(200);
        res.send(uri);
    });
});

/**
 * s3に画像をアップロード後、画像のURI、シナリオID、サイズなどの情報をDBへ登録する
 *
 * key:
 *   S3上でのユニークキー。クライアント生成
 * fileSize:
 *   ファイルサイズ
 * width:
 * height:
 *
 * scenarioId:
 *   シナリオID。画像検索用
 * passPhrase:
 *   パスフレーズ。画像検索用
 * tags:
 *   タグの配列。画像検索用
 * contentType:
 *   MIMEタイプを保持
 */
router.put('/s3', function(req, res, next) {
    let key         = req.body.key;
    let fileSize    = req.body.fileSize;
    let width       = parseInt(req.body.width);
    let height      = parseInt(req.body.height);
    let scenarioId  = req.body.scenarioId || '';
    let passPhrase  = req.body.passPhrase;
    let tags        = req.body.tags;
    let contentType = req.body.contentType;
    
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
    
        let document = {
            key        : key,
            fileSize   : fileSize,
            width      : width,
            height     : height,
            tags       : tags,
            scenarioId : scenarioId,
            contentType: contentType,
        };
    
        if (passPhrase) {
            document.passPhrase = passPhrase;
        }
        
        db.collection('images')
            .insertOne(document, function(error, doc) {
                assert.equal(null, error);
                res.status(200);
                res.send();
            });
    })
});

module.exports = router;

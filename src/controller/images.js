let express   = require('express');
let router    = express.Router();
let mc        = require('mongodb').MongoClient;
let assert    = require('assert');
let timestamp = require('../mabo_modules/timestamp');
let fs        = require('fs');
let AWS       = require('aws-sdk');

require('dotenv').config();

const MONGO_PATH = process.env.MONGODB_PATH;

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
    
    mc.connect(MONGO_PATH, function(error, db) {
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
 * Amazon S3へのアップロード(PUT)用の一時URIを発行
 */
router.get('/signedURI/:request', function(req, res, next) {
    let request = req.params.request || '';
    let key = req.query.key.trim();
    
    if (['getObject', 'putObject'].indexOf(request) === -1) {
        res.status(400);
        res.send('不正な操作要求です。');
    }
    if (typeof key !== 'string' || key === '') {
        res.status(400);
        res.send('ファイル名が不正です。');
    }
    
    let params = {
        Bucket : AMAZON_S3_IMAGE_BUCKET,
        Key    : `${key}`,
    };
    
    switch (request) {
        case 'getObject':
            params.Expires = AMAZON_S3_URI_EXPIRES_GET;
            break;
        case 'putObject':
            params.Expires     = AMAZON_S3_URI_EXPIRES_PUT;
            params.ContentType = 'image/*';
            break;
    }

    /*
     * 一時URIを取得して返却
     */
    s3.getSignedUrl(request, params, function(error, uri) {
        if (error) {
            res.status(500);
            console.log(error);
            res.send('');
        }
        res.status(200);
        res.send(uri);
    });
});

/**
 * s3に画像をアップロード後、画像のURI、シナリオID、サイズなどの情報をDBへ登録する
 */
router.put('/s3', function(req, res, next) {
    let key        = req.body.key;
    let fileSize   = req.body.fileSize;
    let width      = parseInt(req.body.width);
    let height     = parseInt(req.body.height);
    let scenarioId = req.body.scenarioId || '';
    let tags       = req.body.tags;
    
    mc.connect(MONGO_PATH,function(error,db){
        assert.equal(null, error);
    
        let document = {
            key       : `images/${key}`,
            fileSize  : fileSize,
            width     : width,
            height    : height,
            tags      : tags,
            scenarioId: scenarioId
        };
        db.collection('images')
            .insertOne(document, function(error, doc) {
                assert.equal(null, error);
                res.status(200);
                res.send();
            });
    })
});

/**
 * POSTアクセスで画像をアップロードする場合。
 * ローカルの開発用。
 * AWS環境ではAmazon S3を使用するため、このルーティングは使用しない。
 */
router.post('', function(req, res, next) {
    /*
     * Data URI schemeを取り除き、(先頭の「data:image/jpeg;base64」みたいなやつ)
     * バイナリ(Blob)へデコード
     */
    let raw    = req.body.images.base64;
    let b64img = raw.split(',')[1];
    let decode = Buffer.from(b64img, 'base64');
    
    let fileName   = `${timestamp()}_${req.body.images.name}`;
    let fileSize   = req.body.images.fileSize;
    let width      = req.body.images.width;
    let height     = req.body.images.height;
    let tags       = req.body.images.tags;
    let scenarioId = req.body.images.scenarioId || '';
    
    let filePath = '';
    
    /*
     * バリデーション
     */
    if (fileSize > 3 * 1024 * 1024) {
        console.log(`[Failed] file too large. ${Math.round(fileSize / 1024)}kbytes.`);
        res.status(314);
        res.send('ファイルサイズが大きすぎます。');
        return false;
    }
    
    filePath = `${IMAGE_PATH}/${fileName}`;
    fs.writeFile(`${IMAGE_PATH}/${fileName}`, decode, function(e) {
        if (e) {
            console.log(`[Failed] Write \'${fileName}\' to ${IMAGE_PATH}, exit.`);
            throw e;
        }
        console.log(`Write file \'${fileName}\' to ${IMAGE_PATH}.`);
    });
    
    /*
     * DBへタグ、パスを登録する
     */
    mc.connect(MONGO_PATH, function(error, db) {
        assert.equal(null, error);
        let document = {
            filePath  : `${IMAGE_PATH}/${fileName}`,
            fileSize  : fileSize,
            width     : width,
            height    : height,
            tags      : tags,
            scenarioId: scenarioId
        };
        db.collection('images')
            .insertOne(document, function(error, db) {
                assert.equal(null, error);
                console.log('  insert document into \'images\'!'); // @DELETEME
                console.log(document); // @DELETEME
            });
    });
    res.status(200);
    res.send();
});

module.exports = router;

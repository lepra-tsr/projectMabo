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
 * S3の一時認証URLを取得するのに必要なキーを取得する、検索用エンドポイント。
 * 検索結果としてkeyを含むドキュメントを返却する。
 * (※keyが既知の場合は、署名付きURI取得エンドポイントで直接取得すること)
 *
 * 以下の条件で検索
 *   * タグ(複数指定可能)
 *       複数指定した場合、それぞれで完全一致検索してORで結合。
 *   * シナリオID
 *       完全一致。
 *   * パスフレーズ
 *       完全一致。
 *
 */
router.get('', function(req, res, next) {
  let scenarioId = req.query.scenarioId;
  let key        = req.query.key;
  let tags       = req.query.tags;
  let passPhrase = req.query.passPhrase;
  
  /*
   * 検索条件
   */
  let query = {}
  if (scenarioId) {
    query.scenarioId = {$eq: scenarioId};
  }
  if (key) {
    query.key = {$eq: key};
  }
  if (tags) {
    query.tags = {$in: tags.trim().split(',')};
  }
  if (passPhrase) {
    if (typeof passPhrase === 'string' && passPhrase.trim().length !== 0) {
      query.passPhrase = {$eq: passPhrase};
    }
  }
  
  /*
   * 論理削除済みのものは除外
   */
  query.deleted = {$ne: true};
  
  let projection = {
    _id: 0
  }
  
  mc.connect(mongoPath, (error, db) => {
    assert.equal(null, error);
    db.collection('images')
      .find(query, projection)
      .toArray((error, doc) => {
        res.send(doc);
      })
  })
});

/**
 * 画像の論理削除を行うエンドポイント。
 * シナリオIDが異なる画像は論理削除不可。
 *
 * 論理削除フラグは deleted
 */
router.delete('', function(req, res, next) {
  let key        = req.query.key;
  let scenarioId = req.query.scenarioId;
  
  if (key.trim().split(',').length === 0) {
    res.status(400);
    res.send();
    return false
  }
  if (typeof scenarioId !== 'string') {
    res.status(400);
    res.send();
    return false;
  }
  
  let keyArray = key.trim().split(',');
  
  let query = {};
  query.key = {$in: keyArray};
  
  mc.connect(mongoPath, (error, db) => {
    assert.equal(null, error);
    db.collection('images')
      .find(query)
      .toArray((error, docs) => {
        assert.equal(error, null);
        
        let count = docs.length;
        
        if (count === 0) {
          /*
           * 件数を確認し、0件の場合は対象画像なしとして終了
           */
          res.status(204);
          res.send();
          return false;
        }
        
        /*
         * 検索条件に「指定したシナリオIDと等しい」を追加
         */
        query.scenarioId = {$eq: scenarioId};
        
        /*
         * 削除フラグ
         */
        let operation  = {};
        operation.$set = {deleted: true};
        
        db.collection('images')
          .updateMany(query, operation, (error, ack) => {
            if (error) {
              console.log(`\u001b[31m`); // red
              console.error(error);
              console.log(`\u001b[0m`); // reset
            }
            
            if (ack.result.n !== count) {
              /*
               * 削除対数件数と、削除した件数が異なる場合
               */
              res.status(206);
              res.send();
              return false;
            }
            
            res.status(200);
            res.send();
          })
      })
  })
  
});

/**
 * タグの編集用エンドポイント。
 *
 * キーを使用して検索し、tagsの値でupdateする。
 */
router.patch('/tag', function(req, res, next) {
  let key  = req.body.key;
  let tags = req.body.tags;
  
  if (typeof key !== 'string' || key.trim() === '') {
    res.status(400);
    res.send();
    return false
  }
  if (tags instanceof Array === false) {
    res.status(400);
    res.send();
    return false
  }
  
  let query = {}
  query.key = {$eq: key};
  
  let operation  = {};
  operation.$set = {tags: tags};
  
  mc.connect(mongoPath, (error, db) => {
    assert.equal(null, error);
    db.collection('images')
      .find(query)
      .toArray((error, docs) => {
        assert.equal(error, null);
        
        if (docs.length === 0) {
          res.status(204)
          res.send()
          return false;
        }
        
        db.collection('images')
          .updateMany(query, operation, (error, ack) => {
            if (error) {
              console.log(`\u001b[31m`); // red
              console.error(error);
              console.log(`\u001b[0m`); // reset
            }
            res.status(200);
            res.send()
          })
      })
  })
})

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
  let name        = req.body.name;
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
      name       : name,
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

/**
 * Amazon S3へGETする際の一時URIを発行する。
 *
 * key:
 *   クライアント側で生成する、S3上でのユニークなID
 */
router.get('/signedURI/getObject', function(req, res, next) {
  let request = 'getObject';
  let key     = req.query.key.trim();
  
  if (typeof key !== 'string' || key === '') {
    res.status(400);
    res.send('ファイル名が不正です。');
    return false;
  }
  
  let params = {
    Bucket : AMAZON_S3_IMAGE_BUCKET,
    Key    : `${key}`,
    Expires: AMAZON_S3_URI_EXPIRES_GET
  };
  
  let query = {key: {$eq: key}};
  mc.connect(mongoPath, (error, db) => {
    assert.equal(error, null);
    db.collection('images')
      .find(query)
      .toArray((error, docs) => {
        assert.equal(error, null);
        if (docs.length !== 1) {
          res.status(304);
          res.send();
          return false;
        }
        
        let image = docs[0];
        
        /*
         * 一時URIを取得して返却
         */
        s3.getSignedUrl(request, params, (error, uri) => {
          if (error) {
            res.status(500);
            console.log(error);
            res.send();
            return false;
          }
          
          let result = {
            uri   : uri,
            width : image.width,
            height: image.height,
          }
          res.status(200);
          res.send(result);
        });
      })
  })
});


/**
 * Amazon S3へPUTする際の一時URIを発行する
 *
 * key:
 *   クライアント側で生成する、S3上でのユニークなID
 * contentType:
 */
router.get('/signedURI/putObject', function(req, res, next) {
  let key         = req.query.key.trim();
  let contentType = req.query.contentType || '';
  
  if (typeof key !== 'string' || key === '') {
    res.status(400);
    res.send('ファイル名が不正です。');
    return false;
  }
  
  /*
   * putの場合、contentTypeは必須
   */
  if (typeof contentType !== 'string' || contentType === '') {
    res.status(400);
    res.send('contentTypeは必須項目です。');
    return false;
  }
  
  if (!/^image\//.test(contentType)) {
    res.status(400);
    res.send(`MIMEタイプ「${contentType}」から、画像と判定出来ませんでした。`);
    return false;
  }
  
  let params = {
    Bucket     : AMAZON_S3_IMAGE_BUCKET,
    Key        : `${key}`,
    Expires    : AMAZON_S3_URI_EXPIRES_PUT,
    ContentType: contentType,
  };
  
  /*
   * 一時URIを取得して返却
   */
  s3.getSignedUrl('putObject', params, function(error, uri) {
    if (error) {
      res.status(500);
      console.log(error);
      res.send();
    }
    res.status(200);
    res.send(uri);
  });
});

module.exports = router;

let express     = require('express');
let router      = express.Router();
let mc          = require('mongodb').MongoClient;
let assert      = require('assert');
let timestamp   = require('../mabo_modules/timestamp');
let fs          = require('fs');
let def         = require('../mabo_modules/def');
const mongoPath = def.mongoPath;
const imagePath = def.imagePath;

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
router.post('', function(req, res, next) {
    /*
     * Data URI schemeを取り除き、(先頭の「data:image/jpeg;base64」みたいなやつ)
     * バイナリ(Blob)へデコード
     */
    let raw    = req.body.images.base64;
    let b64img = raw.split(',')[1];
    let decode = Buffer.from(b64img, 'base64');
    
    let fileName = `${timestamp()}_${req.body.images.name}`;
    let fileSize = req.body.images.fileSize;
    let width    = req.body.images.width;
    let height   = req.body.images.height;
    let tags     = req.body.images.tags;
    
    /*
     * バリデーション
     */
    if (fileSize > 3 * 1024 * 1024) {
        console.log(`[Failed] file too large. ${Math.round(fileSize / 1024)}kbytes.`);
        let err    = new Error('File too large.');
        err.status = 314;
        throw err;
    }
    
    /*
     * ファイルへ書き出し
     */
    fs.writeFile(`${imagePath}/${fileName}`, decode, function(e) {
        if (e) {
            console.log(`[Failed] Write \'${fileName}\' to ${imagePath}, exit.`);
            throw e;
        }
    });
    console.log(`Write file \'${fileName}\' to ${imagePath}.`);
    
    /*
     * DBへタグ、パスを登録する
     */
    mc.connect(mongoPath, function(error, db) {
        assert.equal(null, error);
        let document = {
            filePath: `${imagePath}/${fileName}`,
            fileSize: fileSize,
            width   : width,
            height  : height,
            tags    : tags,
        };
        db.collection('images')
            .insertOne(document, function() {
                assert.equal(null, error);
                console.log('  insert document into \'images\'!'); // @DELETEME
                console.log(document); // @DELETEME
                db.close();
            });
    });
    res.send([]);
});

module.exports = router;

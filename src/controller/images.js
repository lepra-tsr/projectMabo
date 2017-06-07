let express     = require('express');
let router      = express.Router();
let mc          = require('mongodb').MongoClient;
let assert      = require('assert');
let fs          = require('fs');
const imagePath = './images';

router.post('/', function(req, res, next) {
    /*
     * Data URI schemeを取り除く(先頭の「data:image/jpeg;base64」みたいなやつ)
     */
    let raw    = req.body.images.base64;
    let b64img = raw.split(',')[1];
    /*
     * バイナリ(Blob)へデコード
     */
    let decode = Buffer.from(b64img, 'base64');
    
    /*
     * 書き出し
     */
    fs.writeFile(`${imagePath}/${req.body.images.name}`, decode, function(e) {
        if (e) {
            throw e;
        }
    });
    res.send([]);
});


module.exports = router;

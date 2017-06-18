let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    /*
     * viewにパラメータを投げる
     */
    res.render('index', {title: 'Express'});
});

/* GET node page. */
router.get('/node', function(req, res, next) {
    res.render('node/index', {title: 'Mabo'});
});


/* Mabo login form */
router.get('/mabo', function(req, res, next) {
    res.render('mabo/index', {title: 'Welcome to Mabo'});
});

module.exports = router;

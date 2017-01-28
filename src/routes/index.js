var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {title: 'Express'});
});

/* GET home page. */
router.get('/mabo', function(req, res, next) {
    res.render('mabo/index', {title: 'Mabo'});
});

module.exports = router;

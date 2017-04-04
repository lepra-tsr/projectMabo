var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
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

/* Mabo scenario */
router.get('/mabo/scenario', function(req, res, next) {
    res.render('mabo/scenario/index', {title: 'Scenarios'});
});

/* Mabo playground */
router.get('/mabo/scenario/:id(\\d+)', function(req, res, next) {
    console.info(req.params.id); // @DELETEME
    res.render('mabo/scenario/playground', {id: req.params.id});

});


module.exports = router;

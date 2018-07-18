const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('lobby/index', { title: 'Rooms' });
});

module.exports = router;

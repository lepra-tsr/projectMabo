const express = require('express');
const router = express.Router();

router.get(/\/[0-9a-fA-F]{24}$/, (req, res, next) => {
  res.render('room/index');
});

module.exports = router;

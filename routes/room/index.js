const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('room/');
});

router.get(/\/[0-9a-fA-F]{24}\/[0-9a-fA-F]{64}/, (req, res, next) => {
  const path = req.path;
  const pattern = /\/([0-9a-fA-F]{24})\/([0-9a-fA-F]{64})/;
  const [_, roomId, hash] = pattern.exec(path);

  /* check room existence */
  /* check room auth */
  // res.render('lobby/index');
  console.log(roomId, hash); // @DELETEME
  res.cookie(); // @WIP
  res.redirect(); // @WIP

  res.render('room/index', { roomId, hash });
});

module.exports = router;

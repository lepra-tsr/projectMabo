let express = require('express');
let router  = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  /*
   * viewにパラメータを投げる
   */
  res.render('index', {title: 'Mabo'});
});

/* download */
router.get('/mabo', function(req, res, next) {
  let platform = req.query.platform;
  if (['osx', 'win'].indexOf(platform) === -1) {
    res.status(400);
    res.send();
  }
  
  let appPath;
  switch (platform) {
    case 'win':
      appPath = ``;
      break;
    case 'osx':
      appPath = ``;
      break;
    default:
      break;
  }
  
  res.download(appPath, (error) => {
    
    if (error) {
      console.log(error)
    }
    
    console.log(`client downloaded: ${platform}`);
  });
});

module.exports = router;

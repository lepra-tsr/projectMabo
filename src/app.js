/*
 * require modules
 */
let express      = require('express');
let path         = require('path');
let favicon      = require('serve-favicon');
let logger       = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser   = require('body-parser');
let index        = require('./controller/index');
let characters   = require('./controller/characters');
let images       = require('./controller/images');
let scenarios    = require('./controller/scenarios');
let boards       = require('./controller/boards');
let pawns        = require('./controller/pawns');

let app = express();

// __dirnameはソースコードのファイルパスを返す(/var/www/html)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// faviconを配置したらコメントアウトを外す
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '3mb', extended: true}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

/*
 * ルーティング
 */
app.use('/', index);
app.use('/characters', characters);
app.use('/images', images);
app.use('/scenarios', scenarios);
app.use('/boards', boards);
app.use('/pawns', pawns);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err  = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

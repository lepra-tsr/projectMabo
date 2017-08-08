let gulp    = require('gulp');
let    sass    = require('gulp-sass');
// let    plumber = require('gulp-plumber');
// let    eslint  = require('gulp-eslint');
// let    jsmin   = require('gulp-uglify');
// let    rename  = require('gulp-rename');
let    webpack = require('webpack');
let    watch   = require('gulp-watch');
const scssDir = './stylesheets/scss' ;



/**
 * compile ./sass/.scss in following command
 * $ gulp sass
 */
gulp.task('sass', function() {
  // input source
  gulp.src(`${scssDir}/**/*.scss`)
  // error logging
      .pipe(sass().on('error', sass.logError))
      // compile to .css
      .pipe(gulp.dest('./stylesheets'))
});

/**
 * compile ./js/.js in following command
 * $ gulp js-min
 */
gulp.task('js-min', function() {
  // input source
  gulp.src('./js/**/*.js')
  // minify
      .pipe(jsmin())
      // add postfix
      .pipe(rename({suffix: '.min'}))
      // compile to .js.min
      .pipe(gulp.dest('./js'))
});

/**
 * do tasks 'sass', 'js-min' at once in following command
 * $ gulp deploy
 */
gulp.task('deploy', function() {
  gulp.start(['sass']);
  gulp.start(['js-min']);
});

/**
 * watch folders and auto compile
 * $ gulp watch
 */
gulp.task('watch', function() {
  // sass
  watch('./sass/', function() {
    gulp.start(['sass']);
  });

  // js
  watch('./public/js/', function() {
    gulp.start(['js-min']);
  });
});

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    // jsmin = require('gulp-uglify'),
    // rename = require('gulp-rename'),
    watch = require('gulp-watch');

/**
 * compile ./sass/.scss in following command
 * $ gulp sass
 */
gulp.task('sass', function() {
  // input source
  gulp.src('./public/stylesheets/scss/**/*.scss')
  // error logging
      .pipe(sass().on('error', sass.logError))
      // compile to .css
      .pipe(gulp.dest('./public/stylesheets'))
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
      .pipe(gulp.dest('./public/js'))
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
  watch('./js/', function() {
    gulp.start(['js-min']);
  });
});
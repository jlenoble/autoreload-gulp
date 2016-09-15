var gulp = require('gulp');

var hello = function(done) {
  console.log('Hello!');
  done();
};

gulp.task('hello', hello);

gulp.task('watch', gulp.series('hello', function(done) {
  gulp.watch('src/autoreload-gulp', hello);
  done();
}));
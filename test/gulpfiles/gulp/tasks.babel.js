import gulp from 'gulp';

const hello = done => {
  console.log('Hello!');
  done();
};

gulp.task('hello', hello);

gulp.task('watch', gulp.series('hello', done => {
  gulp.watch('src/autoreload-gulp', hello);
  done();
}));

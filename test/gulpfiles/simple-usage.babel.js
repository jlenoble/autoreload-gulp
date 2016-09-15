import gulp from 'gulp';
import autoreload from './src/autoreload-gulp';

gulp.task('watch', done => {
  console.log('gulpfile1');
  gulp.watch('src/main.js', () => gulp.src('src/main.js')
    .pipe(gulp.dest('build')));
  done();
});

gulp.task('default', autoreload('watch'));

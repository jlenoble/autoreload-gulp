import gulp from 'gulp';
import autoreload from './src/autoreload-gulp';

gulp.task('watch', done => {
  console.log('gulpfile3');
  throw new Error('Test error');
  done();
});

gulp.task('default', autoreload('watch'));

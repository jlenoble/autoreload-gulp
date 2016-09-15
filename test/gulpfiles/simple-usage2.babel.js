import gulp from 'gulp';
import autoreload from './src/autoreload-gulp';
import babel from 'gulp-babel';

gulp.task('watch', done => {
  console.log('gulpfile2');
  gulp.watch('src/main.js', () => gulp.src('src/main.js')
    .pipe(babel())
    .pipe(gulp.dest('build')));
  done();
});

gulp.task('default', autoreload('watch'));

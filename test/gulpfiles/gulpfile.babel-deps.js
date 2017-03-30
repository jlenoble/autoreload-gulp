import gulp from 'gulp';
import autoreload from './src/autoreload-gulp';
import './gulp/tasks.babel';

gulp.task('default', autoreload('watch'));

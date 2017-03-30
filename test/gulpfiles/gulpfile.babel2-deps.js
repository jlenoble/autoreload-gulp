import gulp from 'gulp';
import autoreload from './src/autoreload-gulp';
import './gulp-tasks/tasks.babel';

gulp.task('default', autoreload('watch'));

var gulp = require('gulp');
var autoreload = require('./src/autoreload-gulp');

require('./gulp/tasks.js');

gulp.task('default', autoreload('watch'));

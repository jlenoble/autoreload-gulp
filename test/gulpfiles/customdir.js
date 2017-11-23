var gulp = require('gulp');
var autoreload = require('./src/autoreload-gulp');

require('./test/gulpfiles/gulp/tasks.js');

gulp.task('default', autoreload('watch', 'test/gulpfiles/gulp'));

import testGulpProcess from 'test-gulp-process';
import gulp from 'gulp';
import path from 'path';
import replace from 'gulp-replace';
import {hellos} from './helpers';

const update = options => {
  return new Promise((resolve, reject) => {
    const gulpPath = path.join(options.dest, 'test/gulpfiles/gulp/tasks.js');
    return gulp.src(gulpPath, {base: options.dest})
      .pipe(replace(hellos[4], hellos[5]))
      .pipe(replace(hellos[3], hellos[4]))
      .pipe(replace(hellos[2], hellos[3]))
      .pipe(replace(hellos[1], hellos[2]))
      .pipe(replace(hellos[0], hellos[1]))
      .on('end', resolve)
      .on('error', reject)
      .pipe(gulp.dest(options.dest));
  });
};

describe('Testing custom gulpDir', function () {
  it(`Testing gulpfile 'gulpfiles/customdir.js'`, testGulpProcess({
    sources: ['src/**/*.js', 'test/**/*.js'],
    gulpfile: 'test/gulpfiles/customdir.js',
    messages: [
      `Starting 'default'...`,
      `Finished 'default' after`,
      `Starting 'watch'...`,
      `Starting 'hello'...`,
      hellos[0],
      `Finished 'hello' after`,
      [`Finished 'watch' after`, update],
      `Starting 'hello'...`,
      hellos[1],
      [`Finished 'hello' after`, update],
      `Starting 'hello'...`,
      hellos[2],
      [`Finished 'hello' after`, update],
      `Starting 'hello'...`,
      hellos[3],
      [`Finished 'hello' after`, update],
      `Starting 'hello'...`,
      hellos[4],
      [`Finished 'hello' after`, update],
      `Starting 'hello'...`,
      hellos[5],
      [`Finished 'hello' after`, update],
    ],
  }));
});

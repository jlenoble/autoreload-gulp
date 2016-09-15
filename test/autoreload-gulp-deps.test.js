import gulp from 'gulp';
import replace from 'gulp-replace';
import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import {expect} from 'chai';
import path from 'path';
import del from 'del';
import fse from 'fs-extra';

describe('Testing autoreload-gulp with dependencies', function() {

  const hellos = ['Hello!', 'Hola!', 'Hallo!', 'Ciao!', 'Salut!', 'Ave!'];

  function factory(stem, dir) {
    return function() {
      this.timeout(20000);

      const gulpfilePath = path.join('build', stem + '.js');
      const tasksDir = path.join('build', dir);
      const tasksPath = path.join(tasksDir,
        /\.babel/.test(stem) ? 'tasks.babel.js' : 'tasks.js');

      switch (dir) {
        case 'gulp-tasks':
          stem += 2; break;
        case 'gulp_tasks':
          stem += 3; break;
      }

      try {
        (function sleep(ms) {
          var start = new Date().getTime();
          var expire = start + ms;
          while (new Date().getTime() < expire) {}
        })(1000); // Space out somewhat tests to avoid writing conflicts on disc

        fse.copySync(path.join('test/gulpfiles', stem + '-deps.js'),
          gulpfilePath);
        fse.copySync('test/gulpfiles/gulp', tasksDir);
      } catch (err) {
        return Promise.reject(err);
      }

      process.env.BABEL_DISABLE_CACHE = 1; // Don't use Babel caching for these tests

      const proc = childProcessData(spawn('gulp', [
        '--gulpfile',
        gulpfilePath
      ], {detached: true})); // Make sure all test processes will be killed

      return new Promise((resolve, reject) => {
        var counter = 0;
        var lastPos;

        proc.then(res => {
          function processRes() {
            proc.then(res => {
              const pos = res.allMessages.length - 1;
              const message = res.allMessages[pos];

              if (message.match(/Finished 'watch'/) &&
                lastPos !== pos) {
                counter++;
                lastPos = pos;

                try {
                  let array = res.outMessages.slice(pos - 10, pos);
                  expect(array).to.include(// Chunks are sometimes unexpected
                    // so go through several chunks instead of only one
                    hellos[counter - 1] + '\n');
                } catch (err) {
                  clearAll(reject, err);
                  return;
                }

                if (counter < 6) {
                  gulp.src(tasksPath)
                    .pipe(replace(hellos[4], hellos[5]))
                    .pipe(replace(hellos[3], hellos[4]))
                    .pipe(replace(hellos[2], hellos[3]))
                    .pipe(replace(hellos[1], hellos[2]))
                    .pipe(replace(hellos[0], hellos[1]))
                    .pipe(gulp.dest(tasksDir));
                } else {
                  clearAll(resolve);
                }
              }
            });
          }

          function clearAll(callback, val) {
            if (intervalID === null) {
              return;
            }

            clearInterval(intervalID);
            intervalID = null;

            process.kill(-res.childProcess.pid); // Kill last test process,
            // which was not killed by autoreload

            Promise.all([del(gulpfilePath), del(tasksDir)])
            .then(() => {callback(val);});
          }

          var intervalID = setInterval(processRes, 200);

          function timeout() {
            clearAll(reject,
              new Error('Waiting too long for child process to finish'));
          }

          setTimeout(timeout, 18000);
        });

        proc.catch(reject);
      });
    };
  }

  ['gulp', 'gulp-tasks', 'gulp_tasks'].forEach(dir => {
    it(`Autoreloading gulpfile.js with deps in ${dir}`,
      factory('gulpfile', dir));
    it(`Autoreloading gulpfile.babel.js with deps in ${dir}`,
      factory('gulpfile.babel', dir));
  });

});

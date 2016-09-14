import gulp from 'gulp';
import replace from 'gulp-replace';
import {spawn, exec} from 'child_process';
import childProcessData from 'child-process-data';

describe('Testing autoreload-gulp', function() {

  function factory(gulpfilePath) {
    return function() {
      this.timeout(10000);

      const proc = childProcessData(spawn('gulp', [
        '--gulpfile',
        gulpfilePath
      ], {detached: true})); // Make sure all test processes will be killed

      return new Promise((resolve, reject) => {
        var counter = 0;
        var lastSize = 0;

        proc.then(res => {
          function processRes() {
            proc.then(res => {
              const message = res.allMessages[res.allMessages.length - 1];

              if (message.match(/Finished 'watch'/) &&
                lastSize !== res.allMessages.length) {
                counter++;
                lastSize = res.allMessages.length;

                if (counter < 6) {
                  gulp.src(gulpfilePath)
                    .pipe(replace('Salut!', 'Ave!'))
                    .pipe(replace('Ciao!', 'Salut!'))
                    .pipe(replace('Hallo!', 'Ciao!'))
                    .pipe(replace('Hola!', 'Hallo!'))
                    .pipe(replace('Hello!', 'Hola!'))
                    .pipe(gulp.dest('build'));
                } else {
                  clearAll();
                  resolve();
                }
              }
            });
          }

          function clearAll() {
            if (intervalID === null) {
              return;
            }

            clearInterval(intervalID);
            intervalID = null;

            process.kill(-res.childProcess.pid); // Kill last test process,
            // which was not killed by autoreload

            gulp.src(gulpfilePath)
              .pipe(replace('Ave!', 'Hello!'))
              .pipe(replace('Salut!', 'Hello!'))
              .pipe(replace('Ciao!', 'Hello!'))
              .pipe(replace('Hallo!', 'Hello!'))
              .pipe(replace('Hola!', 'Hello!'))
              .pipe(gulp.dest('build'));
          }

          var intervalID = setInterval(processRes, 200);

          function timeout() {
            clearAll();
            reject(new Error('Waiting too long for child process to finish'));
          }

          setTimeout(timeout, 8000);
        });

        proc.catch(err => {
          reject(err);
        });
      });
    };
  }

  it('Autoreloading gulpfile.js', factory('build/gulpfile.js'));

  it('Autoreloading gulpfile.babel.js', factory('build/gulpfile.babel.js'));

  it('Autoreloading gulpfile.js and dependencies');

  it('Autoreloading gulpfile.babel.js and dependencies');

});

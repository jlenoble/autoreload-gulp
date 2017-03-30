import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import {expect} from 'chai';
import del from 'del';
import fse from 'fs-extra';

describe('Testing autoreload-gulp', function () {
  function factory (gulpfilePath) {
    return function () {
      this.timeout(20000); // eslint-disable-line no-invalid-this

      try {
        fse.copySync('test/gulpfiles/simple-usage.babel.js', gulpfilePath);
      } catch (err) {
        return Promise.reject(err);
      }

      process.env.BABEL_DISABLE_CACHE = 1; // Don't use Babel caching for
      // these tests

      const proc = childProcessData(spawn('gulp', [
        '--gulpfile',
        gulpfilePath,
      ], {detached: true})); // Make sure all test processes will be killed

      return new Promise((resolve, reject) => {
        var counter = 0;
        var lastPos;

        proc.then(res => {
          function processRes () {
            proc.then(res => {
              const pos = res.allMessages.length - 1;

              if (lastPos !== pos) {
                lastPos = pos;

                let messages = res.allMessages.slice(pos - 5);

                let match = messages[5].match(/Finished 'watch'/);

                if (!match) {
                  match = messages[5].match(/Error: Test error\n/);
                  messages.join().match(/'watch' errored after/);
                }

                if (match) {
                  counter++;

                  switch (counter) {
                  case 1:
                    try {
                      expect(messages).to.include('gulpfile1\n');
                    } catch (err) {
                      clearAll();
                      reject(err);
                      return;
                    }
                    try {
                      fse.copySync('test/gulpfiles/simple-usage2.babel.js',
                        gulpfilePath);
                    } catch (err) {
                      return Promise.reject(err);
                    }
                    break;

                  case 2:
                    try {
                      expect(messages).to.include('gulpfile2\n');
                    } catch (err) {
                      clearAll();
                      reject(err);
                      return;
                    }
                    try {
                      fse.copySync('test/gulpfiles/simple-usage3.babel.js',
                        gulpfilePath);
                    } catch (err) {
                      return Promise.reject(err);
                    }
                    break;

                  case 3:
                    try {
                      expect(messages).to.include('gulpfile3\n');
                    } catch (err) {
                      clearAll();
                      reject(err);
                      return;
                    }
                    try {
                      fse.copySync('test/gulpfiles/simple-usage.babel.js',
                        gulpfilePath);
                    } catch (err) {
                      return Promise.reject(err);
                    }
                    break;

                  default:
                    clearAll();
                    resolve();
                  }
                }
              }
            });
          }

          function clearAll () {
            if (intervalID === null) {
              return;
            }

            clearInterval(intervalID);
            intervalID = null;

            process.kill(-res.childProcess.pid); // Kill last test process,
            // which was not killed by autoreload

            del(gulpfilePath);
          }

          var intervalID = setInterval(processRes, 200);

          function timeout () {
            clearAll();
            reject(new Error('Waiting too long for child process to finish'));
          }

          setTimeout(timeout, 18000);
        });

        proc.catch(reject);
      });
    };
  }

  it('Autoreloading gulpfile.js', factory('build/gulpfile.babel.js'));
});

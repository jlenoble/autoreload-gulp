import gulp from 'gulp';
import {spawn} from 'child_process';
import fs from 'fs';
import path from 'path';

const autoreload = (task) => {
  return () => {
    var p;

    function checkGulpDir(dir) {
      return new Promise((resolve, reject) => {
        fs.stat(dir, function(err, stats) {
          if (err) {
            return reject(err);
          }
          if (!stats.isDirectory()) {
            return reject(new Error(`${dir} is not a directory!`));
          } else {
            resolve(dir);
          }
        });
      });
    }

    function spawnChild(done) {
      if (p) { p.kill(); }
      p = spawn('gulp', [task], {stdio: 'inherit'});
      if (done) {
        done();
      }
    }

    function swapResolution(promise) { // (A\/B)° = A°/\B°
      return new Promise((resolve, reject) =>
        Promise.resolve(promise).then(reject, resolve));
    }

    function any(promises) {
      return swapResolution(Promise.all(promises.map(swapResolution)));
    };

    const promise = any(['gulp', 'gulp-tasks', 'gulp_tasks'].map(checkGulpDir));

    return promise.then(dir => {
      gulp.watch(['gulpfile(.babel|).js', path.join(dir, '**/*.js')],
        spawnChild);
      spawnChild();
    }, err => {
      gulp.watch('gulpfile(.babel|).js', spawnChild);
      spawnChild();
    });
  };
};

export default autoreload;

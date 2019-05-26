import gulp from "gulp";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import psTree from "ps-tree";

const deepKill = function(pid, _signal, _callback) {
  const signal = _signal || "SIGKILL";
  const callback = _callback || function() {};

  psTree(pid, (err, children) => {
    [pid]
      .concat(
        children.map(p => {
          return p.PID;
        })
      )
      .forEach(tpid => {
        try {
          process.kill(tpid, signal);
        } catch (ex) {}
      });
    callback();
  });
};

const autoreload = (task, gulpDir) => {
  return () => {
    let p;

    function checkGulpDir(dir) {
      return new Promise((resolve, reject) => {
        fs.stat(dir, (err, stats) => {
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
      if (p) {
        deepKill(p.pid);
      }
      p = spawn("gulp", [task], { stdio: "inherit" });
      if (done) {
        done();
      }
    }

    function swapResolution(promise) {
      // (A\/B)° = A°/\B°
      return new Promise((resolve, reject) =>
        Promise.resolve(promise).then(reject, resolve)
      );
    }

    function any(promises) {
      return swapResolution(Promise.all(promises.map(swapResolution)));
    }

    const promise = gulpDir
      ? Promise.resolve(gulpDir)
      : any(["gulp", "gulp-tasks", "gulp_tasks"].map(checkGulpDir));

    return promise.then(
      dir => {
        gulp.watch(
          ["gulpfile.js", "gulpfile.babel.js", path.join(dir, "**/*.js")],
          spawnChild
        );
        spawnChild();
      },
      err => {
        gulp.watch(["gulpfile.js", "gulpfile.babel.js"], spawnChild);
        spawnChild();
      }
    );
  };
};

export default autoreload;

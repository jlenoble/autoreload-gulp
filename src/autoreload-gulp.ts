import gulp from "gulp";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import deepKill from "deepkill";

function checkGulpDir(dir: string): Promise<string> {
  return new Promise((resolve, reject): void => {
    fs.stat(dir, (err, stats): void => {
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

async function swapResolution(promise: Promise<string>): Promise<string> {
  try {
    const dir = await promise;
    return Promise.reject(dir);
  } catch (e) {
    return Promise.resolve(e);
  }
}

async function any(promises: Promise<string>[]): Promise<string> {
  try {
    return Promise.reject(await Promise.all(promises.map(swapResolution)));
  } catch (e) {
    // e = not (not A and not B) = A or B
    return Promise.resolve(e);
  }
}

const autoreload = (task: string, gulpDir?: string): (() => void) => {
  return async (): Promise<void> => {
    let p: ChildProcess;

    function spawnChild(done?: () => void): void {
      if (p) {
        deepKill(p.pid);
      }
      p = spawn("gulp", [task], { stdio: "inherit" });
      if (done) {
        done();
      }
    }

    try {
      const dir: string =
        (gulpDir && (await checkGulpDir(gulpDir))) ||
        (await any(["gulp", "gulp-tasks", "gulp_tasks"].map(checkGulpDir)));

      gulp.watch(
        ["gulpfile.js", "gulpfile.babel.js", path.join(dir, "**/*.js")],
        spawnChild
      );
      spawnChild();
    } catch (e) {
      gulp.watch(["gulpfile.js", "gulpfile.babel.js"], spawnChild);
      spawnChild();
    }
  };
};

export default autoreload;

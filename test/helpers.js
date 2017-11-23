import {expect} from 'chai';
import del from 'del';
import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import gulp from 'gulp';
import replace from 'gulp-replace';

export const hellos = ['Hello!', 'Hola!', 'Hallo!', 'Ciao!', 'Salut!', 'Ave!'];

function repeat (action, interval = 200, maxDuration = 4000) {
  let intervalId;
  let timeoutId;

  return new Promise((resolve, reject) => {
    function timeout () {
      clearInterval(intervalId);
      reject(new Error('Waiting too long for child process to finish'));
    }

    intervalId = setInterval(() => {
      try {
        if (action()) {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          resolve(true);
        }
      } catch (e) {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        reject(e);
      }
    }, interval);

    timeoutId = setTimeout(timeout, maxDuration);
  });
}

export function spawnGulpProcess (gulpfilePath) {
  process.env.BABEL_DISABLE_CACHE = 1; // Don't use Babel caching for
  // these tests

  return childProcessData(spawn('gulp', [
    '--gulpfile',
    gulpfilePath,
  ], {detached: true})); // Make sure all test processes will be killed
}

export function updateGulpfile (gulpfilePath, dest) {
  return new Promise((resolve, reject) => {
    gulp.src(gulpfilePath)
      .pipe(replace(hellos[4], hellos[5]))
      .pipe(replace(hellos[3], hellos[4]))
      .pipe(replace(hellos[2], hellos[3]))
      .pipe(replace(hellos[1], hellos[2]))
      .pipe(replace(hellos[0], hellos[1]))
      .on('end', resolve)
      .on('error', reject)
      .pipe(gulp.dest(dest));
  });
}

export function cleanUp (data, ...paths) {
  process.kill(-data.childProcess.pid); // Kill last test process,
  // which was not killed by autoreload

  return Promise.all(paths.map(path => del(path)));
}

export function testData (data, change) {
  let complete = data.outMessages.findIndex(
    el => el.match(/Finished 'watch' after/)) !== -1;

  if (!complete) {
    complete = data.errMessages.findIndex(
      el => el.match(/'watch' errored after/)) !== -1;
  }

  if (complete) {
    expect(data.all()).to.match(new RegExp(change));
  }

  return complete;
}

export function itCallback (options) {
  const {copySources, spawnGulpProcess, updateSources, cleanUp,
    testData, changes} = options;

  return async function () {
    this.timeout(18000); // eslint-disable-line no-invalid-this

    await copySources();

    const data = await spawnGulpProcess();

    try {
      let counter = changes.length - 1;
      let change = changes[changes.length - 1 - counter];

      while (await repeat(() => testData(data, change)) && counter > 0) {
        counter--;
        change = changes[changes.length - 1 - counter];
        data.forget();

        await updateSources();
      }
    } finally {
      await cleanUp(data);
    }
  };
}

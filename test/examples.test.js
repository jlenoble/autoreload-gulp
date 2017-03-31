import fse from 'fs-extra';
import {spawnGulpProcess, cleanUp, itCallback, testData}
  from './helpers';

let counter = 0;
let n;

function updateGulpfile (gulpfilePath) {
  counter++;
  switch (counter) {
  case 1:
    n = ''; break;
  case 2:
    n = '2'; break;
  case 3:
    n = '3'; break;
  default:
    n = ''; break;
  }
  return fse.copy(`test/gulpfiles/simple-usage${n}.babel.js`, gulpfilePath);
}

function makeItCallback (gulpfilePath) {
  const copySources = () => updateGulpfile(gulpfilePath);
  const _spawnGulpProcess = () => spawnGulpProcess(gulpfilePath);
  const updateSources = () => updateGulpfile(gulpfilePath);
  const _cleanUp = data => cleanUp(data, gulpfilePath);

  return itCallback({
    copySources,
    spawnGulpProcess: _spawnGulpProcess,
    updateSources,
    cleanUp: _cleanUp,
    testData,
    changes: ['gulpfile1\n', 'gulpfile2\n', 'gulpfile3\n'],
  });
}

describe('Testing autoreload-gulp', function () {
  it('Autoreloading gulpfile.babel.js', makeItCallback(
    'build/gulpfile.babel.js'));
});

import path from 'path';
import fse from 'fs-extra';
import {spawnGulpProcess, updateGulpfile, cleanUp, testData, itCallback, hellos}
  from './helpers';

function copyGulpfile (gulpfilePath) {
  const file = path.basename(gulpfilePath);
  const srcFile = path.join('./test/gulpfiles', file);
  return fse.copy(srcFile, gulpfilePath);
}

function makeItCallback (gulpfilePath) {
  const copySources = () => copyGulpfile(gulpfilePath);
  const _spawnGulpProcess = () => spawnGulpProcess(gulpfilePath);
  const updateSources = () => updateGulpfile(gulpfilePath, 'build');
  const _cleanUp = data => cleanUp(data, gulpfilePath);

  return itCallback({
    copySources,
    spawnGulpProcess: _spawnGulpProcess,
    updateSources,
    cleanUp: _cleanUp,
    testData,
    changes: hellos,
  });
}

describe('Testing autoreload-gulp', function () {
  it('Autoreloading gulpfile.js', makeItCallback('build/gulpfile.js'));
  it('Autoreloading gulpfile.babel.js', makeItCallback(
    'build/gulpfile.babel.js'));
});

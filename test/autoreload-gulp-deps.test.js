import path from 'path';
import fse from 'fs-extra';
import {spawnGulpProcess, updateGulpfile, cleanUp, testData, itCallback, hellos}
  from './helpers';

function copyGulpfiles (options) {
  let {stem, dir, gulpfilePath, tasksDir} = options;

  switch (dir) {
  case 'gulp-tasks':
    stem += 2; break;
  case 'gulp_tasks':
    stem += 3; break;
  }

  return Promise.all([
    fse.copy(path.join('test/gulpfiles', stem + '-deps.js'), gulpfilePath),
    fse.copy('test/gulpfiles/gulp', tasksDir),
  ]);
}

function makeItCallback (stem, dir) {
  const gulpfilePath = path.join('build', stem + '.js');
  const tasksDir = path.join('build', dir);
  const tasksPath = path.join(tasksDir,
    /\.babel/.test(stem) ? 'tasks.babel.js' : 'tasks.js');

  const copySources = () => copyGulpfiles({stem, dir, gulpfilePath, tasksDir});
  const _spawnGulpProcess = () => spawnGulpProcess(gulpfilePath);
  const updateSources = () => updateGulpfile(tasksPath, tasksDir);
  const _cleanUp = data => cleanUp(data, gulpfilePath, tasksDir);

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
  ['gulp', 'gulp-tasks', 'gulp_tasks'].forEach(dir => {
    it(`Autoreloading gulpfile.js with deps in ${dir}`,
      makeItCallback('gulpfile', dir));
    it(`Autoreloading gulpfile.babel.js with deps in ${dir}`,
      makeItCallback('gulpfile.babel', dir));
  });
});

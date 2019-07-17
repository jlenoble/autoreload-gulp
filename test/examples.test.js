import fse from "fs-extra";
import touchMs from "touch-ms";
import { delay } from "promise-plumber";
import { spawnGulpProcess, cleanUp, itCallback, testData } from "./helpers";

let counter = 0;
let n;

async function updateGulpfile(gulpfilePath) {
  counter++;
  switch (counter) {
    case 1:
      n = "";
      break;
    case 2:
      n = "2";
      break;
    case 3:
      n = "3";
      break;
    default:
      n = "";
      break;
  }

  await fse.copy(`test/gulpfiles/simple-usage${n}.babel.js`, gulpfilePath);

  // gulp.dest doesn't update mtime and chokidar throttles for 5ms, so touch
  // file after 10ms
  await delay(20);
  await touchMs(gulpfilePath);
}

function makeItCallback(gulpfilePath) {
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
    changes: ["gulpfile1\n", "gulpfile2\n", "gulpfile3\n"]
  });
}

describe("Testing autoreload-gulp", () => {
  it(
    "Autoreloading gulpfile.babel.js",
    makeItCallback("build/gulpfile.babel.js")
  );
});

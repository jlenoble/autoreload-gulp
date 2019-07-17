import path from "path";
import fse from "fs-extra";
import touchMs from "touch-ms";
import { delay } from "promise-plumber";
import {
  spawnGulpProcess,
  updateGulpfile,
  cleanUp,
  testData,
  itCallback,
  hellos
} from "./helpers";

async function copyGulpfile(gulpfilePath) {
  const file = path.basename(gulpfilePath);
  const srcFile = path.join("./test/gulpfiles", file);

  await fse.copy(srcFile, gulpfilePath);

  // gulp.dest doesn't update mtime and chokidar throttles for 5ms, so touch
  // file after 10ms
  await delay(20);
  await touchMs(gulpfilePath);
}

function makeItCallback(gulpfilePath) {
  const copySources = () => copyGulpfile(gulpfilePath);
  const _spawnGulpProcess = () => spawnGulpProcess(gulpfilePath);
  const updateSources = () => updateGulpfile(gulpfilePath, "build");
  const _cleanUp = data => cleanUp(data, gulpfilePath);

  return itCallback({
    copySources,
    spawnGulpProcess: _spawnGulpProcess,
    updateSources,
    cleanUp: _cleanUp,
    testData,
    changes: hellos
  });
}

describe("Testing autoreload-gulp", () => {
  it("Autoreloading gulpfile.js", makeItCallback("build/gulpfile.js"));
  it(
    "Autoreloading gulpfile.babel.js",
    makeItCallback("build/gulpfile.babel.js")
  );
});

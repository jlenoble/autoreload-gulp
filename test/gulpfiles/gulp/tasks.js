/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");

const hello = function(done) {
  console.log("Hello!");
  done();
};

gulp.task("hello", hello);

gulp.task(
  "watch",
  gulp.series("hello", done => {
    gulp.watch("src/autoreload-gulp", hello);
    done();
  })
);

const gulp = require("gulp");
const autoreload = require("./src/autoreload-gulp");

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

gulp.task("default", autoreload("watch"));

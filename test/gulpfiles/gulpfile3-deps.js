/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const autoreload = require("./src/autoreload-gulp");

require("./gulp_tasks/tasks.js");

gulp.task("default", autoreload("watch"));

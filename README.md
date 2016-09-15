# autoreload-gulp
Reloads gulp process when gulpfile.js or an imported relative dependency change

## Goal

When developping, you sometimes edit your gulpfile to add new tasks or refine/refactor existing ones. At that point, you have to abort your TDD/BDD processes and restart them. This module makes restarting them easy by watching your gulpfiles and their dependencies. Whenever one of them is modified, it aborts the process and relaunches a new one.

## Simple usage

To use the module, just wrap your target tasks with the function autoreload, which is the default import of the module.

If you have the gulpfile:

```js
import gulp from 'gulp';
import autoreload from 'autoreload-gulp';

gulp.task('watch', done => {
  console.log('gulpfile1');
  gulp.watch('src/main.js', () => gulp.src('src/main.js')
    .pipe(gulp.dest('build')));
  done();
});

gulp.task('default', autoreload('watch'));
```

And run:

```bash
$ gulp
[12:36:36] Requiring external module babel-core/register
[12:36:36] Working directory changed to ~/Projets/autoreload-gulp/build
[12:36:37] Using gulpfile ~/Projets/autoreload-gulp/build/gulpfile.babel.js
[12:36:37] Starting 'default'...
[12:36:38] Finished 'default' after 67 ms
[12:36:39] Requiring external module babel-core/register
[12:36:40] Using gulpfile ~/Projets/autoreload-gulp/build/gulpfile.babel.js
[12:36:40] Starting 'watch'...
gulpfile1
[12:36:40] Finished 'watch' after 15 ms
```

Then modify the gulpfile:

```js
import gulp from 'gulp';
import autoreload from 'autoreload-gulp';
import babel from 'gulp-babel'; // Added

gulp.task('watch', done => {
  console.log('gulpfile2'); // Changed
  gulp.watch('src/main.js', () => gulp.src('src/main.js')
    .pipe(babel()) // Added
    .pipe(gulp.dest('build')));
  done();
});

gulp.task('default', autoreload('watch'));
```

Without your intervention, you get:

```bash
[12:36:40] Starting 'spawnChild'...
[12:36:40] Finished 'spawnChild' after 10 ms
[12:36:41] Requiring external module babel-core/register
[12:36:42] Using gulpfile ~/Projets/autoreload-gulp/build/gulpfile.babel.js
[12:36:42] Starting 'watch'...
gulpfile2
[12:36:42] Finished 'watch' after 13 ms
```

Now messing with the gulpfile:

```js
import gulp from 'gulp';
import autoreload from 'autoreload-gulp';
import babel from 'gulp-babel';

gulp.task('watch', done => {
  console.log('gulpfile3'); // Changed
  throw new Error('Test error'); // Changed
  done();
});

gulp.task('default', autoreload('watch'));
```

You get:

```bash
[12:36:43] Starting 'spawnChild'...
[12:36:43] Finished 'spawnChild' after 17 ms
[12:36:44] Requiring external module babel-core/register
[12:36:44] Using gulpfile ~/Projets/autoreload-gulp/build/gulpfile.babel.js
[12:36:44] Starting 'watch'...
gulpfile3
```

And after fixing:

```bash
Starting 'spawnChild'...
[12:36:45] Finished 'spawnChild' after 7.28 ms
[12:36:46] Requiring external module babel-core/register
[12:36:47] Using gulpfile ~/Projets/autoreload-gulp/build/gulpfile.babel.js
[12:36:47] Starting 'watch'...
gulpfile1
[12:36:47] Finished 'watch' after 12 ms
```

## License

autoreload-gulp is [MIT licensed](./LICENSE).

© [Jason Lenoble](mailto:jason.lenoble@gmail.com)

import gulp from 'gulp';
import replace from 'gulp-replace';
import {spawn, exec} from 'child_process';
import Muter from 'muter';

describe('Testing autoreload-gulp', function() {

  it('Autoreloading gulpfile.js', function() {
    var proc = spawn('gulp', [
      '--gulpfile',
      'build/gulpfile.js'
    ]);

    var counter = 0;
    const muter = Muter(console, 'log');
    muter.mute();

    proc.stdout.on('data', function(data) {
      data = data.toString('utf8');
      console.log(data);

      if (data.includes(`Finished 'watch' after`)) {
        counter++;

        if (counter < 6) {
          gulp.src('build/gulpfile.js')
            .pipe(replace('Salut!', 'Ave!'))
            .pipe(replace('Ciao!', 'Salut!'))
            .pipe(replace('Hallo!', 'Ciao!'))
            .pipe(replace('Hola!', 'Hallo!'))
            .pipe(replace('Hello!', 'Hola!'))
            .pipe(gulp.dest('build'));
        } else {
          proc.kill();

          const logs = muter.getLogs();
          muter.unmute();
          console.log(logs);

          gulp.src('build/gulpfile.js')
            .pipe(replace('Ave!', 'Hello!'))
            .pipe(replace('Salut!', 'Hello!'))
            .pipe(replace('Ciao!', 'Hello!'))
            .pipe(replace('Hallo!', 'Hello!'))
            .pipe(replace('Hola!', 'Hello!'))
            .pipe(gulp.dest('build'));
        }
      }
    });

    proc.stderr.on('data', function(data) {
      data = data.toString('utf8');
      console.log('stderr:', data);
    });

    proc.on('close', function(code) {
      console.log('closing code: ' + code);
    });
  });

  it('Autoreloading gulpfile.babel.js');

  it('Autoreloading gulpfile.js and dependencies');

  it('Autoreloading gulpfile.babel.js and dependencies');

});

import gulp from 'gulp';
import yargs from 'yargs';
import {spawn} from 'child_process';

const autoreload = (task) => {
  return (done) => {
    var p;
    gulp.watch('gulpfile(.babel|).js', spawnChild);
    spawnChild(done);

    function spawnChild(done) {
      if (p) { p.kill(); }

      p = spawn('gulp', [task], {stdio: 'inherit'});
      done();
    }
  };
};

export default autoreload;

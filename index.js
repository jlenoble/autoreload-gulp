'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var autoreload = function autoreload(task) {
  return function (done) {
    var p;
    _gulp2.default.watch('gulpfile(.babel|).js', spawnChild);
    spawnChild(done);

    function spawnChild(done) {
      if (p) {
        p.kill();
      }

      p = (0, _child_process.spawn)('gulp', [task], { stdio: 'inherit' });
      done();
    }
  };
};

exports.default = autoreload;
module.exports = exports['default'];
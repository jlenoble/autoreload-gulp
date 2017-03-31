'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _child_process = require('child_process');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _psTree = require('ps-tree');

var _psTree2 = _interopRequireDefault(_psTree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deepKill = function deepKill(pid, _signal, _callback) {
  var signal = _signal || 'SIGKILL';
  var callback = _callback || function () {};

  (0, _psTree2.default)(pid, function (err, children) {
    [pid].concat(children.map(function (p) {
      return p.PID;
    })).forEach(function (tpid) {
      try {
        process.kill(tpid, signal);
      } catch (ex) {}
    });
    callback();
  });
};

var autoreload = function autoreload(task) {
  return function () {
    var p;

    function checkGulpDir(dir) {
      return new _promise2.default(function (resolve, reject) {
        _fs2.default.stat(dir, function (err, stats) {
          if (err) {
            return reject(err);
          }
          if (!stats.isDirectory()) {
            return reject(new Error(dir + ' is not a directory!'));
          } else {
            resolve(dir);
          }
        });
      });
    }

    function spawnChild(done) {
      if (p) {
        deepKill(p.pid);
      }
      p = (0, _child_process.spawn)('gulp', [task], { stdio: 'inherit' });
      if (done) {
        done();
      }
    }

    function swapResolution(promise) {
      // (A\/B)° = A°/\B°
      return new _promise2.default(function (resolve, reject) {
        return _promise2.default.resolve(promise).then(reject, resolve);
      });
    }

    function any(promises) {
      return swapResolution(_promise2.default.all(promises.map(swapResolution)));
    };

    var promise = any(['gulp', 'gulp-tasks', 'gulp_tasks'].map(checkGulpDir));

    return promise.then(function (dir) {
      _gulp2.default.watch(['gulpfile(.babel|).js', _path2.default.join(dir, '**/*.js')], spawnChild);
      spawnChild();
    }, function (err) {
      _gulp2.default.watch('gulpfile(.babel|).js', spawnChild);
      spawnChild();
    });
  };
};

exports.default = autoreload;
module.exports = exports['default'];
'use strict';

/**
 * Created by opichou on 9/21/16.
 */
/**
 * Created by opichou on 9/19/16.
 */
var connect = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var MongoClient;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            MongoClient = _mongodb2.default.MongoClient;
            _context.next = 3;
            return MongoClient.connect("mongodb://" + _credentials2.default.username + ":" + _credentials2.default.password + "@82.251.11.24:" + _credentials2.default.port + "/" + _credentials2.default.dbName);

          case 3:
            return _context.abrupt('return', _context.sent);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function connect() {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=dbConnect-compiled.js.map


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _parseurl = require('parseurl');

var _parseurl2 = _interopRequireDefault(_parseurl);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _credentials = require('../credentials');

var _credentials2 = _interopRequireDefault(_credentials);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var MongoClient = _mongodb2.default.MongoClient;

//# sourceMappingURL=dbConnect-compiled-compiled.js.map
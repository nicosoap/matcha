'use strict';

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

var _dbConnect = require('./dbConnect');

var dbl = _interopRequireWildcard(_dbConnect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by opichou on 9/19/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


module.exports = {
    connect: function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(login, socket) {
            var db;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return dbl.connect();

                        case 2:
                            db = _context.sent;
                            _context.prev = 3;

                            currentDate = new Date();
                            _context.next = 7;
                            return db.collection('connections').updateOne({ login: login }, { $set: { socket: socket, connected: true, date: currentDate } }, { upsert: true });

                        case 7:
                            _context.prev = 7;

                            db.close();
                            return _context.finish(7);

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined, [[3,, 7, 10]]);
        }));

        return function connect(_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }(),

    disconnect: function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(login, socket) {
            var db;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return dbl.connect();

                        case 2:
                            db = _context2.sent;
                            _context2.prev = 3;

                            currentDate = new Date();
                            _context2.next = 7;
                            return db.collection('connections').updateOne({ login: login }, { $set: { socket: socket, connected: false, date: currentDate } }, { upsert: true });

                        case 7:
                            _context2.prev = 7;

                            db.close();
                            return _context2.finish(7);

                        case 10:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, undefined, [[3,, 7, 10]]);
        }));

        return function disconnect(_x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    }(),

    like: function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(userId, otherId) {
            var db;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return dbl.connect();

                        case 2:
                            db = _context3.sent;

                            try {
                                db.collection('likes').upsert({ userId: userId, otherId: otherId }, { $set: { like: true } });
                            } finally {
                                db.close();
                            }

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, undefined);
        }));

        return function like(_x5, _x6) {
            return _ref3.apply(this, arguments);
        };
    }(),

    doesLike: function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(userId, otherId) {
            var db;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return dbl.connect();

                        case 2:
                            db = _context4.sent;
                            _context4.prev = 3;
                            return _context4.abrupt('return', db.collection('likes').find({ userId: userId, otherId: otherId, like: true }).count() === 1);

                        case 5:
                            _context4.prev = 5;

                            db.close();
                            return _context4.finish(5);

                        case 8:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, undefined, [[3,, 5, 8]]);
        }));

        return function doesLike(_x7, _x8) {
            return _ref4.apply(this, arguments);
        };
    }(),

    match: function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(userId, otherId) {
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return doesLike(userId, otherId);

                        case 2:
                            _context5.t0 = _context5.sent;

                            if (!_context5.t0) {
                                _context5.next = 7;
                                break;
                            }

                            _context5.next = 6;
                            return doesLike(otherId, userId);

                        case 6:
                            _context5.t0 = _context5.sent;

                        case 7:
                            return _context5.abrupt('return', _context5.t0);

                        case 8:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, undefined);
        }));

        return function match(_x9, _x10) {
            return _ref5.apply(this, arguments);
        };
    }()
};
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

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _picture = require('./picture');

var picture = _interopRequireWildcard(_picture);

var _dbConnect = require('./dbConnect');

var dbl = _interopRequireWildcard(_dbConnect);

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};if (obj != null) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
        }newObj.default = obj;return newObj;
    }
}

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
    return function () {
        var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
            function step(key, arg) {
                try {
                    var info = gen[key](arg);var value = info.value;
                } catch (error) {
                    reject(error);return;
                }if (info.done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(function (value) {
                        step("next", value);
                    }, function (err) {
                        step("throw", err);
                    });
                }
            }return step("next");
        });
    };
} /**
   * Created by opichou on 9/19/16.
   */

// var io = require('socket.io-emitter')({host:'localhost', port:3001})
// setInterval(function(){
//     io.emit('time', new Date)
// }, 5000)

// const io = socketIo(server)


module.exports = function (io) {

    var self = {

        now: function now() {
            var currentDate = new Date();
            return currentDate.getDate() + "/" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "/" + currentDate.getFullYear() + " @ " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
        },

        sendNotif: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(login, type, payload) {
                var db, ret, socket;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return dbl.connect();

                            case 2:
                                db = _context.sent;
                                _context.prev = 3;
                                _context.next = 6;
                                return db.collection('connections').findOne({ login: login }, { socket: true });

                            case 6:
                                ret = _context.sent;
                                socket = ret.socket;

                                io.sockets.connected[socket].emit(type, payload);

                            case 9:
                                _context.prev = 9;

                                db.close();
                                return _context.finish(9);

                            case 12:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, undefined, [[3,, 9, 12]]);
            }));

            function sendNotif(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return sendNotif;
        }(),

        connect: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(login, socket) {
                var db, _currentDate;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return dbl.connect();

                            case 2:
                                db = _context2.sent;
                                _context2.prev = 3;
                                _currentDate = new Date();
                                _context2.next = 7;
                                return db.collection('connections').updateOne({ login: login }, {
                                    $set: {
                                        socket: socket,
                                        connected: true,
                                        date: _currentDate
                                    }
                                }, { upsert: true });

                            case 7:
                                if (_config2.default.debug) {
                                    self.sendNotif('opichou', 'like', { body: "Connected to Matcha Server on " + self.now() });
                                }

                            case 8:
                                _context2.prev = 8;

                                db.close();
                                return _context2.finish(8);

                            case 11:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, undefined, [[3,, 8, 11]]);
            }));

            function connect(_x4, _x5) {
                return _ref2.apply(this, arguments);
            }

            return connect;
        }(),

        disconnect: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(login, socket) {
                var db;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return dbl.connect();

                            case 2:
                                db = _context3.sent;
                                _context3.prev = 3;

                                currentDate = new Date();
                                _context3.next = 7;
                                return db.collection('connections').updateOne({ login: login }, {
                                    $set: {
                                        socket: socket,
                                        connected: false,
                                        date: currentDate
                                    }
                                }, { upsert: true });

                            case 7:
                                _context3.prev = 7;

                                db.close();
                                return _context3.finish(7);

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, undefined, [[3,, 7, 10]]);
            }));

            function disconnect(_x6, _x7) {
                return _ref3.apply(this, arguments);
            }

            return disconnect;
        }(),

        ///
        ///
        ///
        ///                     ATTENTION CETTE FONCTION ENVOIE UN MESSAGE A L'EMMETEUR ET DEVRAIT L'ENVOYER AU DESTINATAIRE
        ///
        ///

        //this method logs a like from userId to otherId (being the other member's userId and fires callback
        like: function () {
            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
                var userId, otherId, db, photo, photo2, user, user2, _body, body2, _body2;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                userId = req.user.username, otherId = req.params.userId;
                                _context4.next = 3;
                                return dbl.connect();

                            case 3:
                                db = _context4.sent;
                                _context4.next = 6;
                                return picture.getAll(userId);

                            case 6:
                                photo = _context4.sent;
                                _context4.next = 9;
                                return picture.getAll(otherId);

                            case 9:
                                photo2 = _context4.sent;
                                _context4.prev = 10;
                                _context4.next = 13;
                                return db.collection('likes').updateOne({ userId: userId, otherId: otherId }, { $set: { like: true } }, { upsert: true });

                            case 13:
                                _context4.next = 15;
                                return db.collection('users').findOne({ login: userId });

                            case 15:
                                user = _context4.sent;
                                _context4.next = 18;
                                return db.collection('users').findOne({ login: otherId });

                            case 18:
                                user2 = _context4.sent;
                                _context4.next = 21;
                                return undefined.doeslike(otherId, userId);

                            case 21:
                                if (!_context4.sent) {
                                    _context4.next = 29;
                                    break;
                                }

                                res.send({ success: true, match: true });
                                _body = userId + ' and you matched ! You can now chat with ' + self._him(user) + '.';
                                body2 = otherId + ' and you matched ! You can now chat with ' + self._him(user2) + '.';

                                undefined.sendNotif(otherId, 'match', {
                                    body: _body,
                                    from: userId,
                                    image: photo[0],
                                    read: false
                                });
                                undefined.sendNotif(userId, 'match', {
                                    body2: body2,
                                    from: otherId,
                                    image: photo2[0],
                                    read: false
                                });
                                _context4.next = 33;
                                break;

                            case 29:
                                res.send({ success: true, match: false });
                                if (_config2.default.debug) {
                                    self.sendNotif('opichou', 'like', {
                                        body: _body2,
                                        from: userId,
                                        image: photo[0],
                                        read: false
                                    });
                                }
                                _body2 = userId + ' is interested in you. Check out ' + self._his(db, userId) + ' profile!';

                                undefined.sendNotif(otherId, 'like', {
                                    body: _body2,
                                    from: userId,
                                    image: photo[0],
                                    read: false
                                });

                            case 33:
                                _context4.next = 38;
                                break;

                            case 35:
                                _context4.prev = 35;
                                _context4.t0 = _context4['catch'](10);

                                console.log(_context4.t0);

                            case 38:
                                _context4.prev = 38;

                                db.close();
                                return _context4.finish(38);

                            case 41:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, undefined, [[10, 35, 38, 41]]);
            }));

            function like(_x8, _x9) {
                return _ref4.apply(this, arguments);
            }

            return like;
        }(),

        ///
        ///
        ///
        ///                     ATTENTION CETTE FONCTION ENVOIE UN MESSAGE A L'EMMETEUR ET DEVRAIT L'ENVOYER AU DESTINATAIRE
        ///
        ///
        dislike: function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
                var userId, otherId, db, _body3;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                userId = req.user.username, otherId = req.params.userId;

                                console.log(userId, otherId);
                                _context5.next = 4;
                                return dbl.connect();

                            case 4:
                                db = _context5.sent;

                                try {
                                    db.collection('likes').updateOne({ userId: userId, otherId: otherId }, { $set: { like: false } }, { upsert: true });
                                    res.send({ success: true });
                                    _body3 = userId + ' is not THAT into you after all. Deal with it!';

                                    undefined.sendNotif(userId, 'like', {
                                        body: _body3,
                                        from: userId,
                                        image: photo[0],
                                        read: false
                                    });
                                } catch (err) {
                                    console.log(err);
                                } finally {
                                    db.close();
                                }

                            case 6:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, undefined);
            }));

            function dislike(_x10, _x11) {
                return _ref5.apply(this, arguments);
            }

            return dislike;
        }(),

        block: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res) {
                var userId, otherId, db;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                userId = req.user.username, otherId = req.params.userId;
                                //this method logs a like from userId to otherId (being the other member's userId and fires callback

                                _context6.next = 3;
                                return dbl.connect();

                            case 3:
                                db = _context6.sent;
                                _context6.prev = 4;
                                _context6.next = 7;
                                return db.collection('blocks').upsert({ userId: userId, otherId: otherId }, { $set: { block: true } });

                            case 7:
                                res.send({ success: true });

                            case 8:
                                _context6.prev = 8;

                                db.close();
                                return _context6.finish(8);

                            case 11:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, undefined, [[4,, 8, 11]]);
            }));

            function block(_x12, _x13) {
                return _ref6.apply(this, arguments);
            }

            return block;
        }(),

        doesLike: function () {
            var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(userId, otherId) {
                var db;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return dbl.connect();

                            case 2:
                                db = _context7.sent;
                                _context7.prev = 3;
                                return _context7.abrupt('return', db.collection('likes').find({ userId: userId, otherId: otherId, like: true }).count() === 1);

                            case 5:
                                _context7.prev = 5;

                                db.close();
                                return _context7.finish(5);

                            case 8:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, undefined, [[3,, 5, 8]]);
            }));

            function doesLike(_x14, _x15) {
                return _ref7.apply(this, arguments);
            }

            return doesLike;
        }(),

        match: function () {
            var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(userId, otherId) {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return doesLike(userId, otherId);

                            case 2:
                                _context8.t0 = _context8.sent;

                                if (!_context8.t0) {
                                    _context8.next = 7;
                                    break;
                                }

                                _context8.next = 6;
                                return doesLike(otherId, userId);

                            case 6:
                                _context8.t0 = _context8.sent;

                            case 7:
                                return _context8.abrupt('return', _context8.t0);

                            case 8:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, undefined);
            }));

            function match(_x16, _x17) {
                return _ref8.apply(this, arguments);
            }

            return match;
        }()
    };
    return self;
};

//# sourceMappingURL=interactions-compiled.js.map

//# sourceMappingURL=interactions-compiled-compiled.js.map
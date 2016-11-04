'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.suggest = undefined;

var _dbConnect = require('./dbConnect');

var dbl = _interopRequireWildcard(_dbConnect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by opichou on 11/3/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var suggest = exports.suggest = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(login) {
        var db, user;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        db = dbl.connect();
                        _context2.next = 3;
                        return db.collection('users').findOne({ login: login, active: true });

                    case 3:
                        user = _context2.sent;

                        if (!user) {
                            _context2.next = 6;
                            break;
                        }

                        return _context2.delegateYield(regeneratorRuntime.mark(function _callee() {
                            var query, blocs, liked, likes_me, connections, result;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            query = { active: true };

                                            query.attractedByMale = user.gender === male;
                                            query.attractedByFemale = user.gender === female;
                                            query.attractedByOther = user.gender === other;
                                            query.gender = user.attractedByMale ? 'male' : user.attractedByFemale ? 'female' : 'other';
                                            _context.next = 7;
                                            return db.collection('blocks').find({ $or: [{ userId: login }, { otherId: login }] }).toArray();

                                        case 7:
                                            blocs = _context.sent;
                                            _context.next = 10;
                                            return db.collection('likes').find({ userId: login }).toArray();

                                        case 10:
                                            liked = _context.sent;
                                            _context.next = 13;
                                            return db.collection('likes').find({ otherId: login }).toArray();

                                        case 13:
                                            likes_me = _context.sent;
                                            connections = db.collection('conections').find().toarray();
                                            result = [];
                                            _context.next = 18;
                                            return db.collection('users').find(query).each(function (err, doc) {
                                                if (blocs.filter(function (e) {
                                                    return e.userId === doc.login || e.otherId === doc.login;
                                                }).length === 0) {
                                                    var _user = doc;
                                                    _user.liked = liked.filter(function (e) {
                                                        return e.otherId === doc.login;
                                                    }).length > 0;
                                                    _user.likes_me = likes_me.filter(function (e) {
                                                        return e.userId === doc.login;
                                                    }).length > 0;
                                                    _user.connected = connections.filter({ login: doc.login, conected: conected });
                                                }
                                            });

                                        case 18:

                                            resultats.send({
                                                success: true,
                                                user: user,
                                                liked: !!liked,
                                                likes_me: !!likes_me,
                                                connected: connection.connected,
                                                lastConnection: connection.date,
                                                visited: !!visited,
                                                popularity: var_popularity
                                            });

                                        case 19:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, undefined);
                        })(), 't0', 6);

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function suggest(_x) {
        return _ref.apply(this, arguments);
    };
}();

//# sourceMappingURL=display-compiled.js.map
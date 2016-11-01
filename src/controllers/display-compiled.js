'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.me = exports.One = exports.All = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _dbConnect = require('./dbConnect');

var dbl = _interopRequireWildcard(_dbConnect);

var _credentials = require('../credentials');

var _credentials2 = _interopRequireDefault(_credentials);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _errno_code = require('./errno_code');

var _errno_code2 = _interopRequireDefault(_errno_code);

var _match = require('../model/match');

var _match2 = _interopRequireDefault(_match);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _user2 = require('./user');

var user = _interopRequireWildcard(_user2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var saltRounds = 10;

var transporter = _nodemailer2.default.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');

function now() {
    var currentDate = new Date();
    return currentDate.getDate() + "/" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "/" + currentDate.getFullYear() + " @ " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
}

var encrypt = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(message) {
        var encrypted;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _crypto2.default.createHmac('sha256', _credentials2.default.cookieSecret).update(message, 'utf8', 'hex').digest('hex');

                    case 2:
                        encrypted = _context.sent;
                        return _context.abrupt('return', encrypted);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function encrypt(_x) {
        return _ref.apply(this, arguments);
    };
}();

var decrypt = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(text) {
        var decipher, dec;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        decipher = _crypto2.default.createDecipher('sha256', _credentials2.default.cookieSecret);
                        dec = decipher.update(text, 'hex', 'utf8');

                        dec += decipher.final('utf8');
                        return _context2.abrupt('return', dec);

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function decrypt(_x2) {
        return _ref2.apply(this, arguments);
    };
}();

var All = exports.All = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
        var query, regexHashtag, regexNetflix, regexRightNow, regexAge, regexAgeMin, regexAgeMax, regexPopularity, regexPopularityMin, regexPopularityMax, regexGeocode, regexGeocodeLat, regexGeocodeLng, queryStr, age, popularity, geocode, i, temp, db, results;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        query = {
                            netflix: false,
                            rightnow: false,
                            age: {
                                min: 18,
                                max: 77
                            },
                            popularity: {
                                min: 0,
                                max: 100
                            },
                            geocode: {
                                lat: 0,
                                lng: 0
                            },
                            tags: [],
                            custom: ''
                        }, regexHashtag = /#([a-zA-Z0-9-]*)+/g, regexNetflix = /netflix/i, regexRightNow = /rightnow/i, regexAge = /age-from=([0-9]{1,2}).*age-to=([0-9]{1,2})/i, regexAgeMin = /age-from=[0-9]{1,2}/i, regexAgeMax = /age-to=[0-9]{1,2}/i, regexPopularity = /popularity-from=([0-9]{1,2}).*popularity-to=([0-9]{1,3})/i, regexPopularityMin = /popularity-from=[0-9]{1,2}/i, regexPopularityMax = /popularity-to=[0-9]{1,3}/i, regexGeocode = /around-lat=(-?[0-9]{1,2}\.?[0-9]{0,16}).*around-lng=(-?[0-9]{1,2}\.?[0-9]{0,16})/i, regexGeocodeLat = /around-lat=-?[0-9]{1,2}\.?[0-9]{0,16}/i, regexGeocodeLng = /around-lng=-?[0-9]{1,2}\.?[0-9]{0,16}/i, queryStr = req.query.query || '';


                        query.netflix = regexNetflix.test(queryStr);
                        query.rightnow = regexRightNow.test(queryStr);

                        age = regexAge.exec(queryStr);


                        if (age) {
                            query.age.min = age[1];
                            query.age.max = age[2];
                        }

                        popularity = regexPopularity.exec(queryStr);


                        if (popularity) {
                            query.popularity.min = popularity[1];
                            query.popularity.max = popularity[2];
                        }

                        geocode = regexGeocode.exec(queryStr);


                        if (geocode) {
                            query.geocode.lat = geocode[1];
                            query.geocode.lng = geocode[2];
                        }

                        i = 0, temp = [];

                        while ((temp = regexHashtag.exec(queryStr)) !== null) {
                            query.tags[i] = temp[1];
                            i++;
                        }
                        query.custom = queryStr.replace(regexGeocodeLng, '').replace(regexGeocodeLat, '').replace(regexPopularityMax, '').replace(regexPopularityMin, '').replace(regexAgeMax, '').replace(regexAgeMin, '').replace(regexRightNow, '').replace(regexNetflix, '').replace(regexHashtag, '').replace(/ (?: *)/, ' ').split(' ').filter(function (e) {
                            return e !== '';
                        });

                        _context3.next = 14;
                        return dbl.connect();

                    case 14:
                        db = _context3.sent;
                        _context3.prev = 15;
                        _context3.next = 18;
                        return db.collection('users').find({});

                    case 18:
                        results = _context3.sent;
                        _context3.prev = 19;

                        console.log('sending...');
                        _context3.t0 = res;
                        _context3.next = 24;
                        return results.toArray();

                    case 24:
                        _context3.t1 = _context3.sent;
                        _context3.t2 = {
                            users: _context3.t1
                        };

                        _context3.t0.send.call(_context3.t0, _context3.t2);

                        _context3.next = 32;
                        break;

                    case 29:
                        _context3.prev = 29;
                        _context3.t3 = _context3['catch'](19);

                        console.error(_context3.t3);

                    case 32:
                        _context3.prev = 32;

                        db.close();
                        return _context3.finish(32);

                    case 35:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined, [[15,, 32, 35], [19, 29]]);
    }));

    return function All(_x3, _x4) {
        return _ref3.apply(this, arguments);
    };
}();

var One = exports.One = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
        var login, db, _user;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        console.log("Let's find that user");
                        login = req.user.username;
                        _context4.next = 4;
                        return dbl.connect();

                    case 4:
                        db = _context4.sent;
                        _context4.prev = 5;
                        _context4.next = 8;
                        return db.collection('users').findOne({ login: login, active: true }, { password: false, token: false, fingerprint: false });

                    case 8:
                        _user = _context4.sent;

                        if (_user) {
                            res.send({ success: true, data: _user });
                        } else {
                            res.send({ success: false });
                        }
                        _context4.next = 15;
                        break;

                    case 12:
                        _context4.prev = 12;
                        _context4.t0 = _context4['catch'](5);

                        console.error(_context4.t0);

                    case 15:
                        _context4.prev = 15;

                        db.close();
                        return _context4.finish(15);

                    case 18:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined, [[5, 12, 15, 18]]);
    }));

    return function One(_x5, _x6) {
        return _ref4.apply(this, arguments);
    };
}();

var me = exports.me = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        res.send({ login: req.user.username });

                    case 1:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function me(_x7, _x8) {
        return _ref5.apply(this, arguments);
    };
}();

//# sourceMappingURL=display-compiled.js.map
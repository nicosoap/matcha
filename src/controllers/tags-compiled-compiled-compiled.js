'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.viewAll = exports.addTag = exports.tags = undefined;

var tags = exports.tags = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
        var db, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context.sent;
                        _context.next = 5;
                        return db.colletion('tags').find().sort({ count: desc });

                    case 5:
                        response = _context.sent;

                        res.send({ response: response });

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function tags(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var addTag = exports.addTag = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
        var _this = this;

        var tags, db;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return req.body.tags;

                    case 2:
                        tags = _context4.sent;

                        if (tags === '') {
                            console.log({ status: "ok", tagsCreated: 0 });
                        }
                        _context4.next = 6;
                        return dbl.connect();

                    case 6:
                        db = _context4.sent;
                        _context4.prev = 7;
                        return _context4.delegateYield(regeneratorRuntime.mark(function _callee3() {
                            var bulk, result;
                            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                while (1) {
                                    switch (_context3.prev = _context3.next) {
                                        case 0:
                                            _context3.next = 2;
                                            return db.collection('tags').initializeUnorderedBulkOp();

                                        case 2:
                                            bulk = _context3.sent;
                                            _context3.next = 5;
                                            return tags.filter(function (n) {
                                                return n != '';
                                            }).forEach(function () {
                                                var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(n) {
                                                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                                        while (1) {
                                                            switch (_context2.prev = _context2.next) {
                                                                case 0:
                                                                    bulk.find({ label: n }).upsert().updateOne({ $inc: { count: 1 } });

                                                                case 1:
                                                                case 'end':
                                                                    return _context2.stop();
                                                            }
                                                        }
                                                    }, _callee2, _this);
                                                }));

                                                return function (_x5) {
                                                    return _ref3.apply(this, arguments);
                                                };
                                            }());

                                        case 5:
                                            _context3.next = 7;
                                            return bulk.execute({ w: 1 });

                                        case 7:
                                            result = _context3.sent;

                                            console.error(result);

                                        case 9:
                                        case 'end':
                                            return _context3.stop();
                                    }
                                }
                            }, _callee3, _this);
                        })(), 't0', 9);

                    case 9:
                        _context4.prev = 9;

                        db.close();
                        return _context4.finish(9);

                    case 12:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[7,, 9, 12]]);
    }));

    return function addTag(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

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

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _errno_code = require('./errno_code');

var _errno_code2 = _interopRequireDefault(_errno_code);

var _match = require('../model/match');

var _match2 = _interopRequireDefault(_match);

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
} // ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   user.js                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/19 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var saltRounds = 10;

var transporter = _nodemailer2.default.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');

function now() {
    var currentDate = new Date();
    return currentDate.getDate() + "/" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "/" + currentDate.getFullYear() + " @ " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

var viewAll = exports.viewAll = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
        var regexHashtag, regexNetflix, regexRightNow, regexAge, regexPopularity, regexGeocode, query, netflix, rightnow, age, popularity, geocode, i, tags;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        regexHashtag = /#([a-zA-Z0-9-]*)+/g, regexNetflix = /netflix/i, regexRightNow = /rightnow/i, regexAge = /age-from=([0-9]{1,2}).*age-to=([0-9]{1,2})/i, regexPopularity = /popularity-from=([0-9]{1,2}).*popularity-to=([0-9]{1,3})/i, regexGeocode = /around-lat=([0-9]{1,2}\.{0,1}[0-9]{0,16}).*around-lng=([0-9]{1,2}\.{0,1}[0-9]{0,16})/i, query = req.query.query, netflix = regexNetflix.test(query), rightnow = regexRightNow.test(query), age = regexAge.exec(query), popularity = regexPopularity.exec(query), geocode = regexGeocode.exec(query);
                        i = 0, tags = [];

                        while ((temp = regexHashtag.exec(query)) !== null) {
                            tags[i] = temp[1];
                            i++;
                        }

                        res.send({ message: "User search is unavailable now" });

                    case 4:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function viewAll(_x6, _x7) {
        return _ref4.apply(this, arguments);
    };
}();

//# sourceMappingURL=tags-compiled.js.map

//# sourceMappingURL=tags-compiled-compiled.js.map

//# sourceMappingURL=tags-compiled-compiled-compiled.js.map
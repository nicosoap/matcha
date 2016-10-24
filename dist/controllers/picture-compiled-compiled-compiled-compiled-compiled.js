'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uploadPicture = undefined;

var registerPicture = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(login, filename, ext) {
        var payload, db;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        payload = { user: login, filename: filename, ext: ext, date: Date.now() };

                        console.log(payload);
                        _context.next = 4;
                        return dbl.connect();

                    case 4:
                        db = _context.sent;
                        _context.prev = 5;
                        _context.next = 8;
                        return db.collection('pictures').insertOne(payload);

                    case 8:
                        return _context.abrupt('return', _context.sent);

                    case 9:
                        _context.prev = 9;

                        db.close();
                        return _context.finish(9);

                    case 12:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[5,, 9, 12]]);
    }));

    return function registerPicture(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

var uploadPicture = exports.uploadPicture = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
        var mimes, ext, result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        console.log(req.file);
                        mimes = ["image/jpeg", "image/gif", "image/png"];
                        ext = req.file.originalname;

                        console.log(ext);
                        console.log(req.file.mimetype);

                        if (!(mimes.indexOf(req.file.mimetype) != -1)) {
                            _context2.next = 14;
                            break;
                        }

                        ext = ext.match(/.*(\.gif|\.png|\.jpg|\.jpeg)$/i)[1];
                        console.log(ext);
                        _context2.next = 10;
                        return registerPicture(req.user.username, req.file.filename, ext);

                    case 10:
                        result = _context2.sent;

                        if (result.ok) {
                            res.send({ success: true, message: _errno_code2.default.PICTURE_UPLOAD_SUCCESS });
                        } else {
                            res.send({ success: false, message: _errno_code2.default.PICTURE_REGISTER_ERROR });
                        }
                        _context2.next = 15;
                        break;

                    case 14:
                        res.send({ success: false, message: _errno_code2.default.PICTURE_UPLOAD_ERROR });

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function uploadPicture(_x4, _x5) {
        return _ref2.apply(this, arguments);
    };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

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
                        return step("next", value);
                    }, function (err) {
                        return step("throw", err);
                    });
                }
            }return step("next");
        });
    };
} // ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   picture.js                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/19 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

//# sourceMappingURL=picture-compiled.js.map

//# sourceMappingURL=picture-compiled-compiled.js.map

//# sourceMappingURL=picture-compiled-compiled-compiled.js.map

//# sourceMappingURL=picture-compiled-compiled-compiled-compiled.js.map

//# sourceMappingURL=picture-compiled-compiled-compiled-compiled-compiled.js.map
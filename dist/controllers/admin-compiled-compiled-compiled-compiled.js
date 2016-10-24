'use strict';

var addFormItems = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
        var label, dataType, optionList, multiInput, formItem, db, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(req.user.username === 'olivier')) {
                            _context.next = 22;
                            break;
                        }

                        label = req.body.label;
                        dataType = req.body.dataType;
                        _context.t0 = dataType;
                        _context.next = _context.t0 === "text" ? 6 : _context.t0 === "bigText" ? 7 : _context.t0 === "option" ? 8 : _context.t0 === "imageField" ? 10 : 12;
                        break;

                    case 6:
                        return _context.abrupt('break', 12);

                    case 7:
                        return _context.abrupt('break', 12);

                    case 8:
                        optionList = req.body.optionList.filter(function (n) {
                            return n != '';
                        });
                        return _context.abrupt('break', 12);

                    case 10:
                        multiInput = req.body.multiInput;
                        return _context.abrupt('break', 12);

                    case 12:
                        formItem = { label: label, dataType: dataType, optionList: optionList, multiInput: multiInput };
                        _context.next = 15;
                        return dbl.connect();

                    case 15:
                        db = _context.sent;
                        _context.next = 18;
                        return db.collection('profileItems').addOne(formItem);

                    case 18:
                        response = _context.sent;

                        try {
                            res.send(response);
                        } finally {
                            db.close();
                        }
                        _context.next = 23;
                        break;

                    case 22:
                        res.redirect('/');

                    case 23:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function addFormItems(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

//# sourceMappingURL=admin-compiled.js.map


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
}

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addFormItems = addFormItems;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _parseurl = require('parseurl');

var _parseurl2 = _interopRequireDefault(_parseurl);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

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

// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   admin.js                                           :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/29 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var saltRounds = 10;

var transporter = _nodemailer2.default.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');

//# sourceMappingURL=admin-compiled-compiled.js.map

//# sourceMappingURL=admin-compiled-compiled-compiled.js.map

//# sourceMappingURL=admin-compiled-compiled-compiled-compiled.js.map
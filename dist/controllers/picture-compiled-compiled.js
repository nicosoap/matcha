'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uploadPicture = uploadPicture;
exports.deleteOne = deleteOne;
exports.setAsDefault = setAsDefault;

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

// ************************************************************************** //
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

async function registerPicture(login, filename, ext) {
    var payload = { user: login, filename: filename, ext: ext, active: true, date: Date.now() };
    console.log(payload);
    var db = await dbl.connect();
    try {
        return await db.collection('pictures').insertOne(payload);
    } finally {
        db.close();
    }
}

async function uploadPicture(req, res) {
    console.log(req.file);
    var mimes = ["image/jpeg", "image/gif", "image/png"];
    var ext = req.file.originalname;
    console.log(ext);
    console.log(req.file.mimetype);
    if (mimes.indexOf(req.file.mimetype) != -1) {
        ext = ext.match(/.*(\.gif|\.png|\.jpg|\.jpeg)$/i)[1];
        console.log(ext);
        var result = await registerPicture(req.user.username, req.file.filename, ext);
        console.log(result);
        if (result.insertedCount === 1) {
            res.send({ success: true, message: _errno_code2.default.PICTURE_UPLOAD_SUCCESS });
        } else {
            res.send({ success: false, message: _errno_code2.default.PICTURE_REGISTER_ERROR });
        }
    } else {
        res.send({ success: false, message: _errno_code2.default.PICTURE_UPLOAD_ERROR });
    }
}

async function deleteOne(req, res) {
    var login = req.user.username;
    var filename = req.body.filename;
    var db = await dbl.connect();
    try {
        return await db.collection('pictures').updateOne({ login: login, filename: filename, active: true }, { $set: { active: false } });
    } finally {
        db.close();
    }
}

async function setAsDefault(req, res) {
    var login = req.user.username,
        filename = req.body.filename,
        db = await dbl.connect();
    try {
        db.collection('users').updateOne({ login: login }, { $set: { defaultPicture: filename } });
    } catch (e) {
        console.error(e);
    } finally {
        db.close();
    }
}

//# sourceMappingURL=picture-compiled.js.map

//# sourceMappingURL=picture-compiled-compiled.js.map
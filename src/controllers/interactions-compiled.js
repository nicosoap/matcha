'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _parseurl = require('parseurl');

var _parseurl2 = _interopRequireDefault(_parseurl);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by opichou on 9/19/16.
 */
module.exports = {
    like: function like(userId, otherId, callback) {
        //this method logs a like from userId to otherId (being the other member's userId and fires callback
    },
    doesLike: function doesLike(userId, otherId, callback) {
        //this method checks if a log entry exists for userId liking otherId and fires callback
    },
    match: function match(userId, otherId, callback) {
        //this method checks, giver two user ids if mutual likes exist and fires callback
        doesLike(userId, oherId, function (err, res) {
            if (err) {
                callback(err, false);
            } else if (res) {
                doesLike(otherId, userId, function (err, res) {
                    if (err) {
                        callback(err, false);
                    } else if (res) {
                        callback(err, true);
                    } else {
                        callback(err, false);
                    }
                });
            } else {
                callback(err, false);
            }
        });
    }
};

//# sourceMappingURL=interactions-compiled.js.map
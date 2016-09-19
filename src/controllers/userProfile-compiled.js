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
    update: function update(field, data, callback) {
        //this methods updates the defined FIELD with the defined DATA and fires callback
    },
    upload: function upload(file, callback) {
        //this method uploads a file to the server after verifying its mime type, extension and size. It the fires a
        //callback
    }
};

//# sourceMappingURL=userProfile-compiled.js.map
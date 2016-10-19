'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

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

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _credentials = require('../credentials');

var _credentials2 = _interopRequireDefault(_credentials);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MongoClient = _mongodb2.default.MongoClient; /**
                                                  * Created by opichou on 9/21/16.
                                                  */
/**
 * Created by opichou on 9/19/16.
 */
async function connect() {
  var MongoClient = _mongodb2.default.MongoClient;
  return await MongoClient.connect("mongodb://" + _credentials2.default.username + ":" + _credentials2.default.password + "@82.251.11.24:" + _credentials2.default.port + "/" + _credentials2.default.dbName);
}

//# sourceMappingURL=dbConnect-compiled.js.map
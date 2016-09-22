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

var _user = require('./controllers/user');

var user = _interopRequireWildcard(_user);

var _userProfile = require('./controllers/userProfile');

var _userProfile2 = _interopRequireDefault(_userProfile);

var _interactions = require('./controllers/interactions');

var _interactions2 = _interopRequireDefault(_interactions);

var _dbConnect = require('./controllers/dbConnect');

var _dbConnect2 = _interopRequireDefault(_dbConnect);

var _credentials = require('./credentials');

var _credentials2 = _interopRequireDefault(_credentials);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var app = (0, _express2.default)();

app.disable('X-Powerd-By');

app.use(require('cookie-parser')(_credentials2.default.cookieSecret));

app.use((0, _expressSession2.default)({
    resave: false,
    saveUninitialized: true,
    secret: _credentials2.default.cookieSecret

}));

app.set('port', process.env.PORT || 8081);
app.use(_express2.default.static(__dirname + '/public'));

app.use(_bodyParser2.default.json());

app.use(_bodyParser2.default.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    if (req.session.isLogedIn) {
        res.send('You are signed-in !');
    } else {
        res.redirect('/login');
    }
});

app.post('/login', function (req, res) {
    if (req.body.login && req.body.password) {
        user.authenticate(req.body.login, req.body.password, function (err, ret) {
            if (err) {
                console.error(err);
                res.send('You are not signed in.');
            } else if (ret) {
                res.send('You are signed-in');
            } else {
                res.send('You are not signed in.');
            }
        });
    }
    console.log("Authentication finished");
});

app.get('/user', function (req, res) {});

app.get("/test/login/:login", function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res, next) {
        var valid;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return user.checkLogin(req.params.login);

                    case 3:
                        valid = _context.sent;

                        if (valid != true) {
                            res.send("Login " + req.params.login + " already used");
                        } else {
                            res.send("Login " + req.params.login + " available");
                        }
                        _context.next = 10;
                        break;

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context['catch'](0);
                        next(_context.t0);
                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[0, 7]]);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}());

app.use(function (req, res) {
    res.type('text/html');
    res.status(404);
    res.send('Error 404');
});

app.use(function (err, req, res) {
    console.error(err.stack);
    res.status(500);
    res.send('Error 500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});

//# sourceMappingURL=server-compiled.js.map
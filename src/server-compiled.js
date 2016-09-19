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

var _user2 = _interopRequireDefault(_user);

var _userProfile = require('./controllers/userProfile');

var _userProfile2 = _interopRequireDefault(_userProfile);

var _interations = require('./controllers/interations');

var _interations2 = _interopRequireDefault(_interations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.disable('X-Powerd-By');

var credentials = require('./credentials.js');

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use((0, _expressSession2.default)({
    resave: false,
    saveUninitialized: true,
    secret: credentials.cookieSecret

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
    console.log(req.body);
    if (req.body.login && req.body.password) {
        _user2.default.authenticate(req.body.login, req.body.password, function (err, ret) {
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

app.use(function (req, res) {
    res.type('text/html');
    res.status(404);
    res.send('Error 404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.send('Error 500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});

//# sourceMappingURL=server-compiled.js.map
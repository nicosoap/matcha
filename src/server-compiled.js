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

var _interactions = require('./controllers/interactions');

var _interactions2 = _interopRequireDefault(_interactions);

var _dbConnect = require('./controllers/dbConnect');

var _dbConnect2 = _interopRequireDefault(_dbConnect);

var _credentials = require('./credentials');

var _credentials2 = _interopRequireDefault(_credentials);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

app.get("/testdb", function (req, res) {
    _user2.default.checkLogin("opichou");
});

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
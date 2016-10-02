'use strict';

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

var _user = require('./controllers/user');

var user = _interopRequireWildcard(_user);

var _picture = require('./controllers/picture');

var picture = _interopRequireWildcard(_picture);

var _interactions = require('./controllers/interactions');

var _interactions2 = _interopRequireDefault(_interactions);

var _admin = require('./controllers/admin');

var admin = _interopRequireWildcard(_admin);

var _credentials = require('./credentials');

var _credentials2 = _interopRequireDefault(_credentials);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import io from 'socket.io'


var app = require('express')(); // ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   server.js                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <opichou@student.42.fr>            +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/01 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var http = require('http').Server(app);
var io = require('socket.io')(http);
var upload = (0, _multer2.default)({ dest: __dirname + '/uploads' });

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
app.use((0, _expressJwt2.default)({ secret: _credentials2.default.jwtSecret }).unless({
    path: ['/login', '/retrieve_password', '/activate_account', '/user/new', '/protected', /^\/test/i] }));
app.get('/', function (req, res) {
    if (!req.user) return res.redirect('/login');
    res.send("Welcome dude !!!");
});
app.get('/login', function (req, res) {
    res.send("login page");
});
app.post('/login', user.userLogin);
app.get('/user', user.viewAll);
app.put('/user', user.updateProfile);
app.post('/picture', upload.single('picture'), picture.uploadPicture);
app.post('/picture/delete', picture.deleteOne);
app.post('/user/new', user.create);
app.post('/user/update', user.updateProfile);
app.get('/user/tags', user.tags);
app.post('/user/tags', user.addTag);
app.get('/test/login/:login', user.checkLogin);
app.get('/test/email/:email', user.checkEmail);
app.get('/account/register', user.renderForm);
app.post('/account/change_password', user.changePassword);
app.post('/account/retrieve_password', user.retrievePassword);
app.post('/account/activate', user.isVerified);
app.post('/account/reactivate', user.reactivate);
app.post('/account/delete', user.Delete);
app.post('/admin/userform/', admin.addFormItems);

io.on('connection', function (socket) {
    console.log('a user connected');
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.redirect('/login');
    }
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
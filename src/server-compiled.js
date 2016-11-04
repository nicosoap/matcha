'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _user = require('./controllers/user');

var user = _interopRequireWildcard(_user);

var _tags = require('./controllers/tags');

var tags = _interopRequireWildcard(_tags);

var _picture = require('./controllers/picture');

var picture = _interopRequireWildcard(_picture);

var _admin = require('./controllers/admin');

var admin = _interopRequireWildcard(_admin);

var _credentials = require('./credentials');

var _credentials2 = _interopRequireDefault(_credentials);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socketioJwt = require('socketio-jwt');

var _socketioJwt2 = _interopRequireDefault(_socketioJwt);

var _config = require('./config.json');

var _config2 = _interopRequireDefault(_config);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _display = require('./controllers/display');

var display = _interopRequireWildcard(_display);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import * as interactions from './controllers/interactions'
var corsOptions = {
    origin: '',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}; // ************************************************************************** //
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

var app = require('express')();
var server = _http2.default.createServer(app);
var io = (0, _socket2.default)(server);
var interactions = require('./controllers/interactions')(io);
var upload = (0, _multer2.default)({ dest: __dirname + '/public/images' });

app.disable('x-powered-by');
app.use((0, _cors2.default)());
app.use(require('cookie-parser')(_credentials2.default.cookieSecret));
app.use((0, _expressSession2.default)({
    resave: false,
    saveUninitialized: true,
    secret: _credentials2.default.cookieSecret
}));
app.set('port', process.env.PORT || _config2.default.port || 8080);
app.use('/images', _express2.default.static(__dirname + '/public/images'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({
    extended: true
}));

app.use((0, _expressJwt2.default)({ secret: _credentials2.default.jwtSecret }).unless({
    path: ['/login', '/retrieve_password', '/user/new', '/protected', '/public', /^\/admin\/userform/i, /^\/images\//i, /^\/test/i] }));

io.use(_socketioJwt2.default.authorize({
    secret: _credentials2.default.jwtSecret,
    handshake: true
}));

//--ROUTES--/ />

app.get('/', function (req, res) {
    res.send("Welcome dude !!!");
});
app.post('/login', user.userLogin);
app.get('/i', (0, _cors2.default)(corsOptions), display.me);
app.get('/whoami', (0, _cors2.default)(corsOptions), display.me);
app.get('/user', (0, _cors2.default)(corsOptions), display.All);
app.get('/user/:userId', (0, _cors2.default)(corsOptions), display.One);
app.post('/user/locate', (0, _cors2.default)(corsOptions), user.locate);
app.put('/user', user.updateProfile);
app.post('/image', (0, _cors2.default)(corsOptions), upload.single('picture'), picture.uploadPicture);
app.post('/image/delete', picture.deleteOne);
app.post('/user/new', (0, _cors2.default)(corsOptions), user.create);
app.post('/user/update', (0, _cors2.default)(corsOptions), user.updateProfile);
app.get('/tags', tags.tags);
app.post('/tags', tags.addTag);
app.get('/test/login/:login', user.checkLogin);
app.get('/test/email/:email', user.checkEmail);
app.get('/account/register', user.renderForm);
app.post('/account/change_password', user.changePassword);
app.post('/account/retrieve_password', user.retrievePassword);
app.get('/activate_account', (0, _cors2.default)(corsOptions), user.isVerified);
app.post('/account/reactivate', user.reactivate);
app.post('/account/delete', user.Delete);
app.post('/admin/form/', (0, _cors2.default)(corsOptions), admin.addFormItems);
app.get('/admin/userform', (0, _cors2.default)(corsOptions), admin.getUserForm);
app.get('/config', (0, _cors2.default)(corsOptions), admin.getParams);
app.get('/admin/appConfig', (0, _cors2.default)(corsOptions), admin.getAppConfig);
app.get('/like/:userId', (0, _cors2.default)(corsOptions), interactions.like);
app.get('/dislike/:userId', (0, _cors2.default)(corsOptions), interactions.dislike);
app.get('/block/:userId', (0, _cors2.default)(corsOptions), interactions.block);
//--ROUTES--/ />

function now() {
    var currentDate = new Date();
    return currentDate.getDate() + "/" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "/" + currentDate.getFullYear() + " @ " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
}

io.on('connection', function (socket) {
    interactions.connect(socket.decoded_token.username, socket.id);
    console.log(_chalk2.default.bgGreen(socket.decoded_token.username, 'connected on', now()));
    socket.on('message', function (body) {
        socket.emit('message', {
            body: body,
            from: socket.decoded_token.username,
            read: false
        });
    });
    socket.on('like', function (body) {
        socket.broadcast.emit('like', {
            body: body,
            from: socket.decoded_token.username,
            read: false
        });
    });
    socket.on('match', function (body) {
        socket.broadcast.emit('match', {
            body: body,
            from: socket.decoded_token.username,
            read: false
        });
    });
    socket.on('visit', function (body) {
        socket.emit('visit', {
            body: body,
            from: socket.decoded_token.username,
            read: false
        });
    });
    socket.on('disconnect', function () {
        interactions.disconnect(socket.decoded_token.username, socket.id);
        console.log(_chalk2.default.bgRed(socket.decoded_token.username, 'disconnected on', now()));
    });
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.send({ success: false, error: err.name });
    }
});
app.use(function (req, res) {
    res.type('text/html');
    res.status(404);
    res.send('Error 404 Page');
});
app.use(function (err, req, res) {
    console.error(err.stack);
    res.status(500);
    res.send('Error 500 Page');
});
server.listen(app.get('port'), function () {
    console.log("     ******       ******");
    console.log("   **********   **********");
    console.log(" ************* *************");
    console.log("*****************************");
    console.log("*****************************");
    console.log("*****************************");
    console.log(" ***************************");
    console.log("   ***********************");
    console.log("     *******************");
    console.log("       ***************");
    console.log("         ***********");
    console.log("           *******");
    console.log("             ***");
    console.log("              *");
    console.log(" ");
    console.log(" ");
    console.log(" ");
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});

//# sourceMappingURL=server-compiled.js.map
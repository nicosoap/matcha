'use strict';

var genToken = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(user) {
        var myToken, db, update;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _jsonwebtoken2.default.sign({ username: user.login }, _credentials2.default.jwtSecret);

                    case 2:
                        myToken = _context.sent;
                        _context.next = 5;
                        return dbl.connect();

                    case 5:
                        db = _context.sent;
                        _context.prev = 6;
                        _context.next = 9;
                        return db.collection('users').updateOne({ login: user.login }, { $set: { token: myToken } });

                    case 9:
                        update = _context.sent;

                        if (!(update.modifiedCount == 1)) {
                            _context.next = 16;
                            break;
                        }

                        user.token = myToken;

                        console.log(user.login + " connected: " + now());
                        return _context.abrupt('return', user);

                    case 16:
                        console.error(_errno_code2.default.TOKEN_ERROR + user.login);
                        user.success = false;
                        user.message = _errno_code2.default.TOKEN_ERROR;
                        return _context.abrupt('return', user);

                    case 20:
                        _context.next = 28;
                        break;

                    case 22:
                        _context.prev = 22;
                        _context.t0 = _context['catch'](6);

                        console.error(_context.t0);
                        user.success = false;
                        user.message = _errno_code2.default.TOKEN_ERROR;
                        return _context.abrupt('return', user);

                    case 28:
                        _context.prev = 28;

                        db.close();
                        return _context.finish(28);

                    case 31:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[6, 22, 28, 31]]);
    }));

    return function genToken(_x) {
        return _ref.apply(this, arguments);
    };
}();

var addFingerprint = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(user, fingerprint) {
        var db;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context2.sent;
                        _context2.prev = 3;

                        db.collection('users').updateOne({ login: user.login }, { $push: { fingerprint: fingerprint } });
                        user.fingerprint = fingerprint;
                        return _context2.abrupt('return', user);

                    case 9:
                        _context2.prev = 9;
                        _context2.t0 = _context2['catch'](3);

                        console.error(_context2.t0);

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[3, 9]]);
    }));

    return function addFingerprint(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

var basicAuth = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(login, password, fingerprint, callback) {
        var db;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context5.sent;
                        _context5.prev = 3;
                        _context5.next = 6;
                        return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
                            var user;
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                while (1) {
                                    switch (_context4.prev = _context4.next) {
                                        case 0:
                                            _context4.next = 2;
                                            return db.collection('users').findOne({ $or: [{ login: login, active: true }, { email: login, active: true }] });

                                        case 2:
                                            user = _context4.sent;

                                            try {
                                                db.close();
                                                if (!user) {
                                                    callback({ success: false, message: _errno_code2.default.AUTH_ERROR }, {
                                                        auth: {
                                                            success: false,
                                                            message: _errno_code2.default.AUTH_ERROR
                                                        }
                                                    });
                                                } else {
                                                    _bcrypt2.default.compare(password, user.password, function () {
                                                        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(err, res) {
                                                            var ret, _ret2, _ret3;

                                                            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                                                while (1) {
                                                                    switch (_context3.prev = _context3.next) {
                                                                        case 0:
                                                                            if (!res) {
                                                                                _context3.next = 8;
                                                                                break;
                                                                            }

                                                                            _context3.next = 3;
                                                                            return genToken(user);

                                                                        case 3:
                                                                            user = _context3.sent;

                                                                            console.log("Token received");
                                                                            if (user.fingerprint && contains(user.fingerprint, fingerprint)) {
                                                                                ret = {
                                                                                    auth: {
                                                                                        method: "basic",
                                                                                        success: true,
                                                                                        fingerprint: fingerprint,
                                                                                        token: user.token,
                                                                                        message: _errno_code2.default.LOGIN_SUCCESS_INFO
                                                                                    }
                                                                                };

                                                                                callback(err, ret);
                                                                            } else {
                                                                                console.log("New fingerprint will be added to user profile");
                                                                                user = addFingerprint(user, fingerprint);
                                                                                _ret2 = {
                                                                                    auth: {
                                                                                        method: "basic",
                                                                                        success: true,
                                                                                        fingerprint: fingerprint,
                                                                                        token: user.token,
                                                                                        message: _errno_code2.default.LOGIN_SUCCESS_INFO
                                                                                    }
                                                                                };

                                                                                callback(err, _ret2);
                                                                            }
                                                                            _context3.next = 11;
                                                                            break;

                                                                        case 8:
                                                                            console.log("wrong password");
                                                                            _ret3 = {
                                                                                auth: {
                                                                                    method: "basic",
                                                                                    success: false,
                                                                                    fingerprint: fingerprint,
                                                                                    message: _errno_code2.default.AUTH_PASSWORD_ERROR
                                                                                }
                                                                            };

                                                                            callback(err, _ret3);

                                                                        case 11:
                                                                        case 'end':
                                                                            return _context3.stop();
                                                                    }
                                                                }
                                                            }, _callee3, this);
                                                        }));

                                                        return function (_x8, _x9) {
                                                            return _ref5.apply(this, arguments);
                                                        };
                                                    }());
                                                }
                                            } catch (err) {
                                                callback(err, false);
                                            }

                                        case 4:
                                        case 'end':
                                            return _context4.stop();
                                    }
                                }
                            }, _callee4, this);
                        }))();

                    case 6:
                        _context5.next = 11;
                        break;

                    case 8:
                        _context5.prev = 8;
                        _context5.t0 = _context5['catch'](3);

                        console.error(_context5.t0);

                    case 11:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[3, 8]]);
    }));

    return function basicAuth(_x4, _x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
    };
}();

var tokenAuth = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(token, fingerprint, callback) {
        var db, login, user, ret, _ret4, _ret5, _ret6;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context6.sent;
                        login = _jsonwebtoken2.default.verify(token, _credentials2.default.jwtSecret).username;

                        console.log("token auth for user: " + login);
                        _context6.prev = 5;
                        _context6.next = 8;
                        return db.collection('users').findOne({ login: login, active: true });

                    case 8:
                        user = _context6.sent;

                        if (!user) {
                            ret = {
                                auth: {
                                    method: "token",
                                    success: false,
                                    fingerprint: fingerprint,
                                    message: _errno_code2.default.AUTH_ERROR } };

                            callback(true, ret);
                        } else if (user.fingerprint && contains(user.fingerprint, fingerprint)) {
                            _ret4 = {
                                auth: {
                                    method: "token",
                                    success: true,
                                    fingerprint: fingerprint,
                                    message: _errno_code2.default.LOGIN_SUCCESS_INFO } };

                            callback(false, _ret4);
                        } else {
                            _ret5 = {
                                auth: {
                                    method: "token",
                                    success: true,
                                    fingerprint: false,
                                    message: _errno_code2.default.AUTH_DEVICE_ERROR } };

                            callback(true, _ret5);
                        }
                        _context6.next = 16;
                        break;

                    case 12:
                        _context6.prev = 12;
                        _context6.t0 = _context6['catch'](5);
                        _ret6 = {
                            auth: {
                                method: "token",
                                success: false,
                                fingerprint: fingerprint,
                                message: _errno_code2.default.AUTH_ERROR } };

                        callback(_context6.t0, _ret6);

                    case 16:
                        _context6.prev = 16;

                        db.close();
                        return _context6.finish(16);

                    case 19:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[5, 12, 16, 19]]);
    }));

    return function tokenAuth(_x10, _x11, _x12) {
        return _ref6.apply(this, arguments);
    };
}();

var userLogin = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res) {
        var token;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        token = req.headers.authorization.match(/^Bearer (.*)$/)[1];
                        _context7.next = 3;
                        return authenticate(req.body.login, req.body.password, token, req.body.fingerprint, function (err, ret) {
                            if (err || ret.auth.fingerprint == false) {
                                console.error(err);
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(ret));
                            } else {
                                res.setHeader('Content-Type', 'application/json');
                                res.send(JSON.stringify(ret));
                            }
                        });

                    case 3:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function userLogin(_x13, _x14) {
        return _ref7.apply(this, arguments);
    };
}();

var authenticate = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(login, password, token, fingerprint, callback) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        //This method authenticates user using basic strategy (username and password) or token based strategy.
                        //The first strategy uses Bcrypt to hash and salt the password.
                        //The latter uses JWT to validate the token.
                        //In any case, if a token doesn't exist, one is generated upon authentication success.
                        //After authenticating, if the device fingerprint isn't recognized, user will be required to confirm his identity
                        // using email.
                        //This function fires a callback when succeeding, this callback takes two arguments: err: boolean and ret: object
                        // containing every info about the authentication and its eventual success, if such, user info and details about
                        // device fingerprint status.

                        console.log("Connection attempt from: " + login + ' (token: ' + token + ')');
                        if (token && fingerprint) {
                            tokenAuth(token, fingerprint, callback);
                        } else if (login && password && fingerprint) {
                            basicAuth(login, password, fingerprint, callback);
                        } else {
                            callback({ message: _errno_code2.default.AUTH_ERROR }, { auth: { success: false, message: _errno_code2.default.AUTH_ERROR } });
                        }

                    case 2:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function authenticate(_x15, _x16, _x17, _x18, _x19) {
        return _ref8.apply(this, arguments);
    };
}();

var checkLogin = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(req, res, next) {
        var test;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.prev = 0;
                        _context9.next = 3;
                        return checkLoginHlp(req.params.login);

                    case 3:
                        test = _context9.sent;

                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(test));
                        _context9.next = 11;
                        break;

                    case 8:
                        _context9.prev = 8;
                        _context9.t0 = _context9['catch'](0);

                        next(_context9.t0);

                    case 11:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this, [[0, 8]]);
    }));

    return function checkLogin(_x20, _x21, _x22) {
        return _ref9.apply(this, arguments);
    };
}();

var checkLoginHlp = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(login) {
        var db, collection, userCount;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context10.sent;
                        _context10.prev = 3;
                        collection = db.collection('users');
                        _context10.next = 7;
                        return collection.find({
                            login: login
                        }).limit(1).count();

                    case 7:
                        userCount = _context10.sent;

                        if (!(userCount == 0 && !/([ ])/.exec(login))) {
                            _context10.next = 13;
                            break;
                        }

                        console.log("Login " + login + " is valid");
                        return _context10.abrupt('return', { valid: true, message: "Login " + login + " is available", login: login });

                    case 13:
                        if (!/([ ])/.exec(login)) {
                            _context10.next = 18;
                            break;
                        }

                        console.log("Login " + login + " is not valid");
                        return _context10.abrupt('return', { valid: false, message: "Login " + login + " contains whitespace", login: login });

                    case 18:
                        console.log("Login " + login + " is not valid");
                        return _context10.abrupt('return', { valid: false, message: "Login " + login + " isn't available", login: login });

                    case 20:
                        _context10.prev = 20;

                        db.close();
                        return _context10.finish(20);

                    case 23:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this, [[3,, 20, 23]]);
    }));

    return function checkLoginHlp(_x23) {
        return _ref10.apply(this, arguments);
    };
}();

var checkEmailHlp = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(email) {
        var db, collection, userCount;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context11.sent;
                        _context11.prev = 3;
                        collection = db.collection('users');

                        console.log(collection);
                        _context11.next = 8;
                        return collection.find({
                            email: email
                        }).limit(1).count();

                    case 8:
                        userCount = _context11.sent;

                        if (!(userCount == 0 && email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ig))) {
                            _context11.next = 14;
                            break;
                        }

                        console.log("Email " + email + " is valid");
                        return _context11.abrupt('return', { valid: true, message: "Email " + email + " is available", email: email });

                    case 14:
                        if (!(userCount == 0)) {
                            _context11.next = 19;
                            break;
                        }

                        console.log("Email " + email + " is not valid");
                        return _context11.abrupt('return', { valid: false, error: 1, message: "Email " + email + " is incorrect", email: email });

                    case 19:
                        console.log("Email " + email + " is not valid");
                        return _context11.abrupt('return', { valid: false, error: 2, message: "A profile already exists for " + email, email: email });

                    case 21:
                        _context11.prev = 21;

                        db.close();
                        return _context11.finish(21);

                    case 24:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this, [[3,, 21, 24]]);
    }));

    return function checkEmailHlp(_x24) {
        return _ref11.apply(this, arguments);
    };
}();

var checkEmail = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(req, res) {
        var test;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        _context12.prev = 0;
                        _context12.next = 3;
                        return checkEmailHlp(req.params.email);

                    case 3:
                        test = _context12.sent;

                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(test));
                        _context12.next = 11;
                        break;

                    case 8:
                        _context12.prev = 8;
                        _context12.t0 = _context12['catch'](0);

                        console.error(_context12.t0);

                    case 11:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this, [[0, 8]]);
    }));

    return function checkEmail(_x25, _x26) {
        return _ref12.apply(this, arguments);
    };
}();

var checkPass = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(pass1, pass2) {
        var _password;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        if (!(pass1 === pass2 && pass1.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,48}$/))) {
                            _context13.next = 8;
                            break;
                        }

                        console.log("Password " + pass1 + " is valid");
                        _context13.next = 4;
                        return _bcrypt2.default.hashSync(pass1, saltRounds);

                    case 4:
                        _password = _context13.sent;
                        return _context13.abrupt('return', { valid: true, message: "Valid password", password: _password });

                    case 8:
                        console.log("Password " + pass1 + " is not valid");
                        return _context13.abrupt('return', { valid: false, message: _errno_code2.default.PASSWORD_FORMAT_ERROR });

                    case 10:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function checkPass(_x27, _x28) {
        return _ref13.apply(this, arguments);
    };
}();

var changePasswordHlp = function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(token, password) {
        var returnValue;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        returnValue = null;
                        _context15.next = 3;
                        return _jsonwebtoken2.default.verify(token, _credentials2.default.jwtSecret, function () {
                            var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(err, ret) {
                                var password2, _email, db, update;

                                return regeneratorRuntime.wrap(function _callee14$(_context14) {
                                    while (1) {
                                        switch (_context14.prev = _context14.next) {
                                            case 0:
                                                console.log(err.message);

                                                if (!err) {
                                                    _context14.next = 5;
                                                    break;
                                                }

                                                returnValue = { success: false, message: 'token is corrupted' };
                                                _context14.next = 16;
                                                break;

                                            case 5:
                                                _context14.next = 7;
                                                return _bcrypt2.default.hashSync(password, saltRounds);

                                            case 7:
                                                password2 = _context14.sent;
                                                _email = ret.email;
                                                _context14.next = 11;
                                                return dbl.connect();

                                            case 11:
                                                db = _context14.sent;
                                                _context14.next = 14;
                                                return db.collection('users').updateOne({ email: _email }, { $set: { password: password2 } });

                                            case 14:
                                                update = _context14.sent;

                                                try {
                                                    if (update.modifiedCount == 1) {
                                                        returnValue = { success: true, message: "Password updated successfully" };
                                                    } else {
                                                        returnValue = { success: false, message: "An error happened while updating the password" };
                                                    }
                                                } catch (err) {
                                                    returnValue = { success: false, message: "Database error" };
                                                } finally {
                                                    db.close();
                                                }

                                            case 16:
                                            case 'end':
                                                return _context14.stop();
                                        }
                                    }
                                }, _callee14, this);
                            }));

                            return function (_x31, _x32) {
                                return _ref15.apply(this, arguments);
                            };
                        }());

                    case 3:
                        return _context15.abrupt('return', returnValue);

                    case 4:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    }));

    return function changePasswordHlp(_x29, _x30) {
        return _ref14.apply(this, arguments);
    };
}();

var changePassword = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(req, res) {
        var token, _password2, response;

        return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        token = req.body.token;

                        if (!(req.body.password === req.body.password2)) {
                            _context16.next = 10;
                            break;
                        }

                        _password2 = req.body.password;
                        _context16.next = 5;
                        return changePasswordHlp(token, _password2);

                    case 5:
                        response = _context16.sent;

                        console.log(response);
                        try {
                            console.log(response);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(response);
                        } catch (err) {
                            console.log(err);
                            console.error(err);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(response));
                        }
                        _context16.next = 12;
                        break;

                    case 10:
                        res.setHeader('Content-Type', 'application/json');
                        res.send({ success: false, message: "Passwords didn't match" });

                    case 12:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    }));

    return function changePassword(_x33, _x34) {
        return _ref16.apply(this, arguments);
    };
}();

var requireNewPassword = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(email) {
        var myToken, db, user, mailOptions;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        //this methods sends an email with a temporary link for the user to create a new password
                        myToken = _jsonwebtoken2.default.sign({ email: email }, _credentials2.default.jwtSecret, { expiresIn: 900 });
                        _context17.next = 3;
                        return dbl.connect();

                    case 3:
                        db = _context17.sent;
                        _context17.next = 6;
                        return db.collection('users').findOne({ email: email });

                    case 6:
                        user = _context17.sent;
                        _context17.prev = 7;

                        if (!(!user || !user.firstName)) {
                            _context17.next = 12;
                            break;
                        }

                        return _context17.abrupt('return', { success: "false", message: "User wasn't found" });

                    case 12:
                        mailOptions = {
                            from: '"liveoption" <customer-success@liveoption.io>', // sender address
                            to: user.email, // list of receivers
                            subject: 'Password reset requested on liveoption',
                            html: '<b>Hello,</b></br><p>A password recovery procedure has been requested ' + 'in your name on liveoption.io. If you requested a new password, please' + ' click on the following link to proceed.</p>' + '<a href="http://www.liveoption.io/change_password?token=' + myToken + '">Change my password now</a>' + '<p>If you didn\'t request a password reset, please disregard this email</p>' // html body
                        };
                        _context17.next = 15;
                        return transporter.sendMail(mailOptions);

                    case 15:
                        return _context17.abrupt('return', _context17.sent);

                    case 16:
                        _context17.next = 21;
                        break;

                    case 18:
                        _context17.prev = 18;
                        _context17.t0 = _context17['catch'](7);

                        console.log(_context17.t0);

                    case 21:
                        _context17.prev = 21;

                        db.close();
                        return _context17.finish(21);

                    case 24:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this, [[7, 18, 21, 24]]);
    }));

    return function requireNewPassword(_x35) {
        return _ref17.apply(this, arguments);
    };
}();

var retrievePassword = function () {
    var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(req, res) {
        var email, response;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        email = req.body.email;
                        _context18.next = 3;
                        return requireNewPassword(email, res);

                    case 3:
                        response = _context18.sent;

                        try {
                            console.log(response);
                            res.setHeader('Content-Type', 'application/json');
                            res.send(response);
                            console.log(response);
                        } catch (err) {
                            console.error(err);
                        }

                    case 5:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function retrievePassword(_x36, _x37) {
        return _ref18.apply(this, arguments);
    };
}();

var Delete = function () {
    var _ref19 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20(req, res) {
        var returnValue;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        login = req.body.login;
                        password = req.body.password;
                        fingerprint = req.body.fingerprint;
                        returnValue = null;
                        //this methods allow deletion of a user account after validating password

                        _context20.next = 6;
                        return authenticate(login, password, '', fingerprint, function () {
                            var _ref20 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(err, ret) {
                                var db, status;
                                return regeneratorRuntime.wrap(function _callee19$(_context19) {
                                    while (1) {
                                        switch (_context19.prev = _context19.next) {
                                            case 0:
                                                if (!ret.auth.success) {
                                                    _context19.next = 10;
                                                    break;
                                                }

                                                _context19.next = 3;
                                                return dbl.connect();

                                            case 3:
                                                db = _context19.sent;
                                                _context19.next = 6;
                                                return db.collection('users').updateOne({ login: "login" }, { $set: { active: false } });

                                            case 6:
                                                status = _context19.sent;

                                                try {
                                                    returnValue = status;
                                                } catch (err) {
                                                    console.error(err);
                                                    returnValue = { success: false, state: "error", message: _errno_code2.default.DELETE_ERROR };
                                                } finally {
                                                    db.close();
                                                }
                                                _context19.next = 11;
                                                break;

                                            case 10:
                                                retrunValue = { success: false, state: "error", message: _errno_code2.default.DELETE_ERROR };

                                            case 11:
                                            case 'end':
                                                return _context19.stop();
                                        }
                                    }
                                }, _callee19, this);
                            }));

                            return function (_x40, _x41) {
                                return _ref20.apply(this, arguments);
                            };
                        }());

                    case 6:
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(returnValue));

                    case 8:
                    case 'end':
                        return _context20.stop();
                }
            }
        }, _callee20, this);
    }));

    return function Delete(_x38, _x39) {
        return _ref19.apply(this, arguments);
    };
}();

var renderForm = function () {
    var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(req, res) {
        var db, response;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        _context21.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context21.sent;
                        _context21.next = 5;
                        return db.collection('profileItems').find();

                    case 5:
                        response = _context21.sent;

                        try {
                            res.send(response);
                        } finally {
                            db.close();
                        }

                    case 7:
                    case 'end':
                        return _context21.stop();
                }
            }
        }, _callee21, this);
    }));

    return function renderForm(_x42, _x43) {
        return _ref21.apply(this, arguments);
    };
}();

var create = function () {
    var _ref22 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(req, res) {
        var user, errors, emailProp, loginProp, passwordProp, db;
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        user = {};
                        errors = [];
                        _context22.next = 4;
                        return checkEmailHlp(req.body.email);

                    case 4:
                        emailProp = _context22.sent;
                        _context22.next = 7;
                        return checkLoginHlp(req.body.login);

                    case 7:
                        loginProp = _context22.sent;
                        _context22.next = 10;
                        return checkPass(req.body.password, req.body.password2);

                    case 10:
                        passwordProp = _context22.sent;

                        if (emailProp.valid) {
                            user.email = emailProp.email;
                        } else errors.push(emailProp.message) && console.log("email error logged");
                        if (loginProp.valid) {
                            user.login = loginProp.login;
                        } else errors.push(loginProp.message) && console.log("login error logged");
                        if (passwordProp.valid) {
                            user.password = passwordProp.password;
                        } else errors.push(passwordProp.message) && console.log("password error logged");

                        if (!(errors.length == 0)) {
                            _context22.next = 26;
                            break;
                        }

                        _context22.next = 17;
                        return dbl.connect();

                    case 17:
                        db = _context22.sent;
                        _context22.next = 20;
                        return db.collection('users').insertOne(user);

                    case 20:
                        try {
                            console.log("success");
                        } finally {
                            db.close();
                        }
                        _context22.next = 23;
                        return validateAccount(email);

                    case 23:
                        res.send({ success: true, message: "User created, please check your emails" });
                        _context22.next = 27;
                        break;

                    case 26:
                        res.send({ success: false, message: "Your account couldn't be created", errors: errors });

                    case 27:
                    case 'end':
                        return _context22.stop();
                }
            }
        }, _callee22, this);
    }));

    return function create(_x44, _x45) {
        return _ref22.apply(this, arguments);
    };
}(); //this method adds a new user to the database

var reactivate = function () {
    var _ref23 = _asyncToGenerator(regeneratorRuntime.mark(function _callee23(req, res) {
        var login, password, db, user, myToken, mailOptions;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        login = req.body.login;
                        password = req.body.password;
                        _context23.next = 4;
                        return dbl.connect();

                    case 4:
                        db = _context23.sent;
                        _context23.prev = 5;
                        _context23.next = 8;
                        return db.collection('users').findOneAndUpdate({ login: login, password: password, active: false }, { $set: { active: true } });

                    case 8:
                        user = _context23.sent;

                        console.log(user);

                        if (!(user.nModified != 1)) {
                            _context23.next = 15;
                            break;
                        }

                        console.log("error");
                        res.send({ success: false, message: _errno_code2.default.REACTIVATION_ERROR });
                        _context23.next = 21;
                        break;

                    case 15:
                        myToken = _jsonwebtoken2.default.sign({ email: user.email }, _credentials2.default.jwtSecret, { expiresIn: 9000 }), mailOptions = {
                            from: '"liveoption" <customer-success@liveoption.io>', // sender address
                            to: user.email, // list of receivers
                            subject: 'Your account has been reactivated',
                            html: '<b>Hello,</b></br><p>Your liveoption account has just been reactivated.' + 'If you did not request the reactivation of your liveoption account, <a href="' + req.get('host') + '/">please click here.</a></p>' + '<p>Thank you,</p><p>See you soon !</p>'
                        }; // html body

                        _context23.t0 = res;
                        _context23.next = 19;
                        return transporter.sendMail(mailOptions);

                    case 19:
                        _context23.t1 = _context23.sent;

                        _context23.t0.send.call(_context23.t0, _context23.t1);

                    case 21:
                        _context23.prev = 21;

                        db.close();
                        return _context23.finish(21);

                    case 24:
                    case 'end':
                        return _context23.stop();
                }
            }
        }, _callee23, this, [[5,, 21, 24]]);
    }));

    return function reactivate(_x46, _x47) {
        return _ref23.apply(this, arguments);
    };
}(); //this method reactivates a previously desactivated account

var validateAccount = function () {
    var _ref24 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(email) {
        var myToken, mailOptions;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                        myToken = _jsonwebtoken2.default.sign({ email: email }, _credentials2.default.jwtSecret, { expiresIn: 900 });
                        mailOptions = {
                            from: '"liveoption" <customer-success@liveoption.io>', // sender address
                            to: email, // list of receivers
                            subject: 'Pleasee verify your liveoption account',
                            html: '<b>Hello,</b></br><p>You just created a liveoption account. Please click the following link within the next 15mins. to verify your email address.</p>' + '<a href="http://www.liveoption.io/account/validate?token=' + myToken + '">Validate account now</a>' + '<p>Thank you for registering liveoption,</p><p>See you soon !</p>' // html body
                        };
                        _context24.next = 4;
                        return transporter.sendMail(mailOptions);

                    case 4:
                        return _context24.abrupt('return', _context24.sent);

                    case 5:
                    case 'end':
                        return _context24.stop();
                }
            }
        }, _callee24, this);
    }));

    return function validateAccount(_x48) {
        return _ref24.apply(this, arguments);
    };
}();

var isVerified = function () {
    var _ref25 = _asyncToGenerator(regeneratorRuntime.mark(function _callee25(res, req) {
        var email, db;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
                switch (_context25.prev = _context25.next) {
                    case 0:
                        //this method makes sure the user has authorized his account via email
                        email = req.user.email;
                        _context25.next = 3;
                        return dbl.connect();

                    case 3:
                        db = _context25.sent;

                        try {
                            db.collection('users').updateOne({ email: email }, { $set: { active: true } });
                        } finally {
                            db.close();
                        }
                        res.json({ success: true, message: _errno_code2.default.ACCOUNT_VALIDATED_INFO });

                    case 6:
                    case 'end':
                        return _context25.stop();
                }
            }
        }, _callee25, this);
    }));

    return function isVerified(_x49, _x50) {
        return _ref25.apply(this, arguments);
    };
}();

var updateProfile = function () {
    var _ref26 = _asyncToGenerator(regeneratorRuntime.mark(function _callee26(req, res) {
        var db, payload, _login;

        return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
                switch (_context26.prev = _context26.next) {
                    case 0:
                        _context26.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context26.sent;
                        _context26.prev = 3;
                        payload = req.body;
                        _login = req.user.username;

                        addTag(payload.tags);
                        delete payload.tags;
                        _context26.next = 10;
                        return db.collection('users').updateOne({ login: _login }, { $set: payload });

                    case 10:
                        res.send({ success: true, message: _errno_code2.default.PROFILE_UPDATED_INFO });

                    case 11:
                        _context26.prev = 11;

                        db.close();
                        return _context26.finish(11);

                    case 14:
                    case 'end':
                        return _context26.stop();
                }
            }
        }, _callee26, this, [[3,, 11, 14]]);
    }));

    return function updateProfile(_x51, _x52) {
        return _ref26.apply(this, arguments);
    };
}();

var tags = function () {
    var _ref27 = _asyncToGenerator(regeneratorRuntime.mark(function _callee27(req, res) {
        var db, response;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
            while (1) {
                switch (_context27.prev = _context27.next) {
                    case 0:
                        _context27.next = 2;
                        return dbl.connect();

                    case 2:
                        db = _context27.sent;
                        _context27.next = 5;
                        return db.colletion('tags').find().sort({ count: desc });

                    case 5:
                        response = _context27.sent;

                        res.send({ response: response });

                    case 7:
                    case 'end':
                        return _context27.stop();
                }
            }
        }, _callee27, this);
    }));

    return function tags(_x53, _x54) {
        return _ref27.apply(this, arguments);
    };
}();

var addTag = function () {
    var _ref28 = _asyncToGenerator(regeneratorRuntime.mark(function _callee30(tags) {
        var db;
        return regeneratorRuntime.wrap(function _callee30$(_context30) {
            while (1) {
                switch (_context30.prev = _context30.next) {
                    case 0:
                        _context30.next = 2;
                        return tags;

                    case 2:
                        _context30.t0 = _context30.sent;

                        if (!(_context30.t0 === '')) {
                            _context30.next = 5;
                            break;
                        }

                        console.log({ status: "ok", tagsCreated: 0 });

                    case 5:
                        _context30.next = 7;
                        return dbl.connect();

                    case 7:
                        db = _context30.sent;
                        _context30.prev = 8;
                        _context30.next = 11;
                        return _asyncToGenerator(regeneratorRuntime.mark(function _callee29() {
                            var bulk, result;
                            return regeneratorRuntime.wrap(function _callee29$(_context29) {
                                while (1) {
                                    switch (_context29.prev = _context29.next) {
                                        case 0:
                                            _context29.next = 2;
                                            return db.collection('tags').initializeUnorderedBulkOp();

                                        case 2:
                                            bulk = _context29.sent;
                                            _context29.next = 5;
                                            return req.body.tags.filter(function (n) {
                                                return n != '';
                                            }).forEach(function () {
                                                var _ref30 = _asyncToGenerator(regeneratorRuntime.mark(function _callee28(n) {
                                                    return regeneratorRuntime.wrap(function _callee28$(_context28) {
                                                        while (1) {
                                                            switch (_context28.prev = _context28.next) {
                                                                case 0:
                                                                    bulk.find({ label: n }).upsert().updateOne({ $inc: { count: 1 } });

                                                                case 1:
                                                                case 'end':
                                                                    return _context28.stop();
                                                            }
                                                        }
                                                    }, _callee28, this);
                                                }));

                                                return function (_x56) {
                                                    return _ref30.apply(this, arguments);
                                                };
                                            }());

                                        case 5:
                                            _context29.next = 7;
                                            return bulk.execute({ w: 1 });

                                        case 7:
                                            result = _context29.sent;

                                            console.error(result);

                                        case 9:
                                        case 'end':
                                            return _context29.stop();
                                    }
                                }
                            }, _callee29, this);
                        }))();

                    case 11:
                        _context30.prev = 11;

                        db.close();
                        return _context30.finish(11);

                    case 14:
                    case 'end':
                        return _context30.stop();
                }
            }
        }, _callee30, this, [[8,, 11, 14]]);
    }));

    return function addTag(_x55) {
        return _ref28.apply(this, arguments);
    };
}();

var viewAll = function () {
    var _ref31 = _asyncToGenerator(regeneratorRuntime.mark(function _callee31(res, req) {
        return regeneratorRuntime.wrap(function _callee31$(_context31) {
            while (1) {
                switch (_context31.prev = _context31.next) {
                    case 0:
                        res.send({ message: "OK" });

                    case 1:
                    case 'end':
                        return _context31.stop();
                }
            }
        }, _callee31, this);
    }));

    return function viewAll(_x57, _x58) {
        return _ref31.apply(this, arguments);
    };
}();

//# sourceMappingURL=user-compiled.js.map


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
exports.userLogin = userLogin;
exports.checkLogin = checkLogin;
exports.checkEmail = checkEmail;
exports.changePassword = changePassword;
exports.retrievePassword = retrievePassword;
exports.Delete = Delete;
exports.renderForm = renderForm;
exports.create = create;
exports.reactivate = reactivate;
exports.isVerified = isVerified;
exports.updateProfile = updateProfile;
exports.tags = tags;
exports.addTag = addTag;
exports.viewAll = viewAll;

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
//   user.js                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/19 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

var saltRounds = 10;

var transporter = _nodemailer2.default.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');

function now() {
    var currentdate = new Date();
    return currentdate.getDay() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

//# sourceMappingURL=user-compiled-compiled.js.map

//# sourceMappingURL=user-compiled-compiled-compiled.js.map

//# sourceMappingURL=user-compiled-compiled-compiled-compiled.js.map
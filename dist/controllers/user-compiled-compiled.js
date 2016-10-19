'use strict';

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

async function genToken(user) {
    var myToken = await _jsonwebtoken2.default.sign({ username: user.login }, _credentials2.default.jwtSecret);
    var db = await dbl.connect();
    try {
        var update = await db.collection('users').updateOne({ login: user.login }, { $set: { token: myToken } });
        if (update.modifiedCount == 1) {
            user.token = myToken;

            console.log(user.login + " connected: " + now());
            return user;
        } else {
            console.error(_errno_code2.default.TOKEN_ERROR + user.login);
            user.success = false;
            user.message = _errno_code2.default.TOKEN_ERROR;
            return user;
        }
    } catch (err) {
        console.error(err);
        user.success = false;
        user.message = _errno_code2.default.TOKEN_ERROR;
        return user;
    } finally {
        db.close();
    }
}

async function addFingerprint(user, fingerprint) {
    var db = await dbl.connect();
    try {
        db.collection('users').updateOne({ login: user.login }, { $push: { fingerprint: fingerprint } });
        user.fingerprint = fingerprint;
        return user;
    } catch (err) {
        console.error(err);
    }
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

async function basicAuth(login, password, fingerprint, callback) {
    var db = await dbl.connect();
    try {
        await async function () {
            var user = await db.collection('users').findOne({ $or: [{ login: login, active: true }, { email: login, active: true }] });
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
                    _bcrypt2.default.compare(password, user.password, async function (err, res) {
                        if (res) {
                            user = await genToken(user);
                            console.log("Token received");
                            if (user.fingerprint && contains(user.fingerprint, fingerprint)) {
                                var ret = {
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
                                var _ret2 = {
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
                        } else {
                            console.log("wrong password");
                            var _ret3 = {
                                auth: {
                                    method: "basic",
                                    success: false,
                                    fingerprint: fingerprint,
                                    message: _errno_code2.default.AUTH_PASSWORD_ERROR
                                }
                            };
                            callback(err, _ret3);
                        }
                    });
                }
            } catch (err) {
                callback(err, false);
            }
        }();
    } catch (err) {
        console.error(err);
    }
}

async function tokenAuth(token, fingerprint, callback) {
    var db = await dbl.connect();
    var login = _jsonwebtoken2.default.verify(token, _credentials2.default.jwtSecret).username;
    console.log("token auth for user: " + login);
    try {
        var user = await db.collection('users').findOne({ login: login, active: true });
        if (!user) {
            var ret = {
                auth: {
                    method: "token",
                    success: false,
                    fingerprint: fingerprint,
                    message: _errno_code2.default.AUTH_ERROR } };
            callback(true, ret);
        } else if (user.fingerprint && contains(user.fingerprint, fingerprint)) {
            var _ret4 = {
                auth: {
                    method: "token",
                    success: true,
                    fingerprint: fingerprint,
                    message: _errno_code2.default.LOGIN_SUCCESS_INFO } };
            callback(false, _ret4);
        } else {
            var _ret5 = {
                auth: {
                    method: "token",
                    success: true,
                    fingerprint: false,
                    message: _errno_code2.default.AUTH_DEVICE_ERROR } };
            callback(true, _ret5);
        }
    } catch (err) {
        var _ret6 = {
            auth: {
                method: "token",
                success: false,
                fingerprint: fingerprint,
                message: _errno_code2.default.AUTH_ERROR } };
        callback(err, _ret6);
    } finally {
        db.close();
    }
}

async function userLogin(req, res) {
    var token = req.headers.authorization.match(/^Bearer (.*)$/)[1];
    await authenticate(req.body.login, req.body.password, token, req.body.fingerprint, function (err, ret) {
        if (err || ret.auth.fingerprint == false) {
            console.error(err);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(ret));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(ret));
        }
    });
}

async function authenticate(login, password, token, fingerprint, callback) {
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
}

async function checkLogin(req, res, next) {
    try {
        var test = await checkLoginHlp(req.params.login);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(test));
    } catch (err) {
        next(err);
    }
}

async function checkLoginHlp(login) {
    var db = await dbl.connect();
    try {
        var collection = db.collection('users');
        var userCount = await collection.find({
            login: login
        }).limit(1).count();
        if (userCount == 0 && !/([ ])/.exec(login)) {
            console.log("Login " + login + " is valid");
            return { valid: true, message: "Login " + login + " is available", login: login };
        } else if (/([ ])/.exec(login)) {
            console.log("Login " + login + " is not valid");
            return { valid: false, message: "Login " + login + " contains whitespace", login: login };
        } else {
            console.log("Login " + login + " is not valid");
            return { valid: false, message: "Login " + login + " isn't available", login: login };
        }
    } finally {
        db.close();
    }
    //this method checks if Login already exists in database
}

async function checkEmailHlp(email) {
    var db = await dbl.connect();
    try {
        var collection = db.collection('users');
        console.log(collection);
        var userCount = await collection.find({
            email: email
        }).limit(1).count();
        if (userCount == 0 && email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ig)) {
            console.log("Email " + email + " is valid");
            return { valid: true, message: "Email " + email + " is available", email: email };
        } else if (userCount == 0) {
            console.log("Email " + email + " is not valid");
            return { valid: false, error: 1, message: "Email " + email + " is incorrect", email: email };
        } else {
            console.log("Email " + email + " is not valid");
            return { valid: false, error: 2, message: "A profile already exists for " + email, email: email };
        }
    } finally {
        db.close();
    }
    //this method checks if Email already exists in database
}

async function checkEmail(req, res) {
    try {
        var test = await checkEmailHlp(req.params.email);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(test));
    } catch (err) {
        console.error(err);
    }
}

async function checkPass(pass1, pass2) {
    if (pass1 === pass2 && pass1.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,48}$/)) {
        console.log("Password " + pass1 + " is valid");
        var _password = await _bcrypt2.default.hashSync(pass1, saltRounds);
        return { valid: true, message: "Valid password", password: _password };
    } else {
        console.log("Password " + pass1 + " is not valid");
        return { valid: false, message: _errno_code2.default.PASSWORD_FORMAT_ERROR };
    }
}

async function changePasswordHlp(token, password) {
    var returnValue = null;
    await _jsonwebtoken2.default.verify(token, _credentials2.default.jwtSecret, async function (err, ret) {
        console.log(err.message);
        if (err) {
            returnValue = { success: false, message: 'token is corrupted' };
        } else {
            var password2 = await _bcrypt2.default.hashSync(password, saltRounds);
            var _email = ret.email;
            var db = await dbl.connect();
            var update = await db.collection('users').updateOne({ email: _email }, { $set: { password: password2 } });
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
        }
    });
    return returnValue;
}

async function changePassword(req, res) {
    var token = req.body.token;
    if (req.body.password === req.body.password2) {
        var _password2 = req.body.password;
        var response = await changePasswordHlp(token, _password2);
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
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send({ success: false, message: "Passwords didn't match" });
    }
}

async function requireNewPassword(email) {
    //this methods sends an email with a temporary link for the user to create a new password
    var myToken = _jsonwebtoken2.default.sign({ email: email }, _credentials2.default.jwtSecret, { expiresIn: 900 });
    var db = await dbl.connect();
    var user = await db.collection('users').findOne({ email: email });
    try {
        if (!user || !user.firstName) {
            return { success: "false", message: "User wasn't found" };
        } else {
            var mailOptions = {
                from: '"liveoption" <customer-success@liveoption.io>', // sender address
                to: user.email, // list of receivers
                subject: 'Password reset requested on liveoption',
                html: '<b>Hello,</b></br><p>A password recovery procedure has been requested ' + 'in your name on liveoption.io. If you requested a new password, please' + ' click on the following link to proceed.</p>' + '<a href="http://www.liveoption.io/change_password?token=' + myToken + '">Change my password now</a>' + '<p>If you didn\'t request a password reset, please disregard this email</p>' // html body
            };
            return await transporter.sendMail(mailOptions);
        }
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

async function retrievePassword(req, res) {
    var email = req.body.email;
    var response = await requireNewPassword(email, res);
    try {
        console.log(response);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

async function Delete(req, res) {
    login = req.body.login;
    password = req.body.password;
    fingerprint = req.body.fingerprint;
    var returnValue = null;
    //this methods allow deletion of a user account after validating password
    await authenticate(login, password, '', fingerprint, async function (err, ret) {
        //remove from database and callback to feedback user in the UI
        if (ret.auth.success) {
            var db = await dbl.connect();
            var status = await db.collection('users').updateOne({ login: "login" }, { $set: { active: false } });
            try {
                returnValue = status;
            } catch (err) {
                console.error(err);
                returnValue = { success: false, state: "error", message: _errno_code2.default.DELETE_ERROR };
            } finally {
                db.close();
            }
        } else {
            retrunValue = { success: false, state: "error", message: _errno_code2.default.DELETE_ERROR };
        }
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(returnValue));
}

async function renderForm(req, res) {
    var db = await dbl.connect();
    var response = await db.collection('profileItems').find();
    try {
        res.send(response);
    } finally {
        db.close();
    }
}

async function create(req, res) {
    var user = {},
        errors = [],
        emailProp = await checkEmailHlp(req.body.email),
        loginProp = await checkLoginHlp(req.body.login),
        passwordProp = await checkPass(req.body.password, req.body.password2);

    if (emailProp.valid) {
        user.email = emailProp.email;
    } else errors.push(emailProp.message) && console.log("email error logged");
    if (loginProp.valid) {
        user.login = loginProp.login;
    } else errors.push(loginProp.message) && console.log("login error logged");
    if (passwordProp.valid) {
        user.password = passwordProp.password;
    } else errors.push(passwordProp.message) && console.log("password error logged");
    if (errors.length == 0) {
        var db = await dbl.connect();
        await db.collection('users').insertOne(user);
        try {
            console.log("success");
        } finally {
            db.close();
        }
        await validateAccount(email);
        res.send({ success: true, message: "User created, please check your emails" });
    } else {
        res.send({ success: false, message: "Your account couldn't be created", errors: errors });
    }
} //this method adds a new user to the database

async function reactivate(req, res) {
    var login = req.body.login,
        password = req.body.password,
        db = await dbl.connect();
    try {

        var user = await db.collection('users').findOneAndUpdate({ login: login, password: password, active: false }, { $set: { active: true } });
        console.log(user);
        if (user.nModified != 1) {
            console.log("error");
            res.send({ success: false, message: _errno_code2.default.REACTIVATION_ERROR });
        } else {
            var myToken = _jsonwebtoken2.default.sign({ email: user.email }, _credentials2.default.jwtSecret, { expiresIn: 9000 }),
                mailOptions = {
                from: '"liveoption" <customer-success@liveoption.io>', // sender address
                to: user.email, // list of receivers
                subject: 'Your account has been reactivated',
                html: '<b>Hello,</b></br><p>Your liveoption account has just been reactivated.' + 'If you did not request the reactivation of your liveoption account, <a href="' + req.get('host') + '/">please click here.</a></p>' + '<p>Thank you,</p><p>See you soon !</p>'
            }; // html body
            res.send((await transporter.sendMail(mailOptions)));
        }
    } finally {
        db.close();
    }
} //this method reactivates a previously desactivated account

async function validateAccount(email) {
    var myToken = _jsonwebtoken2.default.sign({ email: email }, _credentials2.default.jwtSecret, { expiresIn: 900 });
    var mailOptions = {
        from: '"liveoption" <customer-success@liveoption.io>', // sender address
        to: email, // list of receivers
        subject: 'Pleasee verify your liveoption account',
        html: '<b>Hello,</b></br><p>You just created a liveoption account. Please click the following link within the next 15mins. to verify your email address.</p>' + '<a href="http://www.liveoption.io/account/validate?token=' + myToken + '">Validate account now</a>' + '<p>Thank you for registering liveoption,</p><p>See you soon !</p>' // html body
    };
    return await transporter.sendMail(mailOptions);
}

async function isVerified(res, req) {
    //this method makes sure the user has authorized his account via email
    var email = req.user.email;
    var db = await dbl.connect();
    try {
        db.collection('users').updateOne({ email: email }, { $set: { active: true } });
    } finally {
        db.close();
    }
    res.json({ success: true, message: _errno_code2.default.ACCOUNT_VALIDATED_INFO });
}

async function updateProfile(req, res) {
    var db = await dbl.connect();
    try {
        var payload = req.body;
        var _login = req.user.username;
        addTag(payload.tags);
        delete payload.tags;
        await db.collection('users').updateOne({ login: _login }, { $set: payload });
        res.send({ success: true, message: _errno_code2.default.PROFILE_UPDATED_INFO });
    } finally {
        db.close();
    }
}

async function tags(req, res) {
    var db = await dbl.connect();
    var response = await db.colletion('tags').find().sort({ count: desc });
    res.send({ response: response });
}

async function addTag(tags) {
    if ((await tags) === '') {
        console.log({ status: "ok", tagsCreated: 0 });
    }
    var db = await dbl.connect();
    try {
        await async function () {
            var bulk = await db.collection('tags').initializeUnorderedBulkOp();
            await req.body.tags.filter(function (n) {
                return n != '';
            }).forEach(async function (n) {
                bulk.find({ label: n }).upsert().updateOne({ $inc: { count: 1 } });
            });
            var result = await bulk.execute({ w: 1 });
            console.error(result);
        }();
    } finally {
        db.close();
    }
}

async function viewAll(res, req) {
    res.send({ message: "OK" });
}

//# sourceMappingURL=user-compiled.js.map

//# sourceMappingURL=user-compiled-compiled.js.map
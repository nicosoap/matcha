/**
 * Created by opichou on 9/19/16.
 */
import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
import bcrypt from 'bcrypt';
import * as dbl from "./dbConnect";
import credentials from '../credentials';
import mongodb from 'mongodb';
import jwt from 'jsonwebtoken';
import expressJWT from 'express-jwt';
import nodemailer from 'nodemailer';
import ERROR from 'errno_code';
const saltRounds = 10;

let MongoClient = mongodb.MongoClient;
let transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');


async function genToken(user){
    let myToken = jwt.sign({username: user.login}, credentials.jwtSecret);
    user.token = myToken;
    const db = await dbl.connect();
    try {
        const update = await db.collection('users').updateOne({login: user.login},{$set: {token: myToken}});
        try {
            if (update.modifiedCount == 1){
                return user;
            } else { console.log(ERROR.TOKEN_ERROR + user.login);}
        } catch (err) {
            console.log(err);
            return false;
        }
    } catch (err) {
        console.log(err);
            return false;
    } finally {
        db.close();
    }
}

function contains(a, obj) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

async function newDevice(userObj, callback){
    if (userObj.user.fingerprint) {
        userObj.user.fingerprint.push(userObj.auth.fingerprint);
    } else {
        userObj.user.fingerprint = [userObj.auth.fingerprint];
    }
    const db = await dbl.connect();
    try {
        const update = await db.collection('users').updateOne({login: userObj.user.login},
            {$set: {fingerprint: userObj.user.fingerprint}});
        try {
            if (update.modifiedCount == 1){
                callback(false, userObj);
            } else {
                console.log(ERROR.FINGERPRINT_ERROR + login);
                callback({success: false, message: ERROR.FINGERPRINT_ERROR}, userObj);
            }
        } catch (err) {
            console.log(err);
            callback(err, userObj);
        }
    } catch (err) {
        console.log(err);
        callback(err, userObj);
    } finally {
        db.close();
    }
}

async function basicAuth(login, password,fingerprint, callback){
    let db = await dbl.connect();
    try {
        let user = await db.collection('users').findOne({login: login, active: true});
        try {
            if (!user) {
                callback({success: false, message: ERROR.AUTH_ERROR}, {
                    auth: {
                        success: false,
                        message: ERROR.AUTH_ERROR
                    }
                });
            } else {
                bcrypt.compare(password, user.password, async function (err, res) {
                    if (!err) {
                        user = await genToken(user);
                        if (user.fingerprint && contains(user.fingerprint, fingerprint)) {
                            const ret = {
                                auth: {
                                    method: "basic",
                                    success: true,
                                    fingerprint: fingerprint,
                                    token: user.token,
                                    message: ERROR.LOGIN_SUCCESS_INFO
                                },
                                user: user
                            };
                            callback(err, ret);
                        } else {
                            const ret = {
                                auth: {
                                    method: "basic",
                                    success: true,
                                    fingerprint: fingerprint,
                                    token: user.token,
                                    message: ERROR.LOGIN_SUCCESS_INFO
                                },
                                user: user
                            };
                            db.close();
                            newDevice(ret, callback);
                        }
                    } else {
                        console.log("wrong password");
                        const ret = {
                            auth: {
                                method: "basic",
                                success: false,
                                fingerprint: fingerprint,
                                message: ERROR.AUTH_PASSWORD_ERROR
                            }
                        };
                        callback(err, ret);
                    }
                });
            }
        }
        catch (err) {
            callback(err, false);
        } finally {
            db.close();
        }
    } catch(err) {
        console.error(err);
    }
}

async function tokenAuth(token, fingerprint, callback){
    let db = await dbl.connect();
    let user = (await db.collection('users').findOne({token: token, active : true}));
    try {
        if (!user) {
            const ret = {
                auth:{
                    method: "token",
                    success: false,
                    fingerprint: fingerprint,
                    message: ERROR.AUTH_ERROR}};
                    console.log(user);
            callback(true, ret);
        } else if (user.fingerprint && contains(user.fingerprint, fingerprint)){
            const ret = {
                auth:{
                    method: "token",
                    success: true,
                    fingerprint: fingerprint,
                    message: ERROR.LOGIN_SUCCESS_INFO},
                user: user};
            callback(false, ret);
        } else {
            const ret = {
                auth:{
                    method: "token",
                    success: true,
                    fingerprint: false,
                    message: ERROR.AUTH_DEVICE_ERROR},
                user: user};
            callback(true, ret);
        }
    }
    catch (err){
        const ret = {
            auth:{
                method: "token",
                success: false,
                fingerprint: fingerprint,
                message: ERROR.AUTH_ERROR}};
        callback(err, ret);
    } finally {
        db.close();
    }
}

export async function userLogin(req, res) {
    await authenticate(req.body.login, req.body.password, req.body.token, req.body.fingerprint, (err, ret) => {
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

async function authenticate(login, password, token, fingerprint, callback){
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
    if (login && password && fingerprint) {
        basicAuth(login, password,fingerprint, callback);
    } else if (token && fingerprint) {
        tokenAuth(token, fingerprint, callback);
    }else {
        callback({message: ERROR.AUTH_ERROR},
            {auth:{success: false, message: ERROR.AUTH_ERROR}});
    }
}

export async function checkLogin(req, res, next){
    try {
        let test = await checkLoginHlp(req.params.login);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(test));
    } catch(err) { next(err)}
}

async function checkLoginHlp(login){
    let db = await dbl.connect();
    try {
        const collection = db.collection('users');
        let userCount = (await collection.find({
            login: login
        }).limit(1).count());
        if (userCount == 0 && !(/([ ])/.exec(login))) {
            return {valid: true, message: "Login " + login + " is available"};
        } else if((/([ ])/.exec(login))){
            return {valid: false, message: "Login " + login + " contains whitespace"};
        } else {
            return {valid: false, message: "Login " + login + " isn't available"};
        }
    } finally {
        db.close();
    }
    //this method checks if Login already exists in database
}

async function checkEmailHlp(email){
    let db = await MongoClient.connect("mongodb://" + credentials.username + ":" + credentials.password + "@82.251.11.24:" + credentials.port + "/" + credentials.dbName);
    try {
        let collection = db.collection('users');
        console.log(collection);
        let userCount = (await collection.find({
            email: email
        }).limit(1).count());
        if (userCount == 0 && (email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ig))) {
            return {valid: true, message: "Email " + email + " is available"};
        } else if(userCount == 0){
            return {valid: false, error: 1, message: "Email " + email + " is incorrect"};
        } else {
            return {valid: false, error: 2, message: "A profile already exists for " + email};
        }
    } finally {
        db.close();
    }
    //this method checks if Email already exists in database
}

export async function checkEmail(req, res, next) => {
    try {
        let test = await checkEmailHlp(req.params.email);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(test));
    } catch(err) { next(err)}
}

async function changePasswordHlp(token, password){
    let returnValue = null;
    await jwt.verify(token, credentials.jwtSecret, async function(err, ret){
        console.log(err.message);
        if (err){
            returnValue = ({ success: false, message: 'token is corrupted' });
        } else {
            let password2 = await bcrypt.hashSync(password, saltRounds);
            const email = ret.email;
            const db = await dbl.connect();
            let update = await db.collection('users').updateOne({email: email}, {$set: {password: password2}});
            try {
                if (update.modifiedCount == 1){
                    returnValue =({success: true, message: "Password updated successfully"});
                } else {
                    returnValue =({success: false, message: "An error happened while updating the password"});
                }
            } catch (err) {
                returnValue =({success: false, message: "Database error"});
            } finally {
                db.close();
            }
        }
    });
    return (returnValue);
}

export async function changePassword(req, res) {
    let token = req.body.token;
    if (req.body.password === req.body.password2){
        const password = req.body.password;
        let response = await changePasswordHlp(token, password);
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
    }else {
        res.setHeader('Content-Type', 'application/json');
        res.send({success: false, message: "Passwords didn't match"});
    }
}

async function requireNewPassword(email){
    //this methods sends an email with a temporary link for the user to create a new password
    let myToken = jwt.sign({email: email}, credentials.jwtSecret, {expiresIn: 900});
    const db = await dbl.connect();
    const user = await db.collection('users').findOne({email: email});
    try {
        if (!user || !user.firstName ) {
            return ({success: "false", message: "User wasn't found"});
        } else {
            let mailOptions = {
                from: '"liveoption" <customer-success@liveoption.io>', // sender address
                to: '"' + user.firstName + ' ' + user.lastName + '" <' + user.email + '>', // list of receivers
                subject: 'Password reset requested for ' + user.firstName + ' ' + user.lastName + ' on liveoption',
                html: '<b>Hello ' + user.firstName + ',</b></br><p>A password recovery procedure has been requested ' +
                'in your name on liveoption.io. If you requested a new password, please' +
                ' click on the following link to proceed.</p>' +
                '<a href="http://www.liveoption.io/password?token=' + myToken + '">Change my password now</a>' +
                '<p>If you didn\'t request a password reset, please disregard this email</p>' // html body
            };
            return await transporter.sendMail(mailOptions);
        }
    }catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

export async function retrievePassword(req, res){
    let email = req.body.email;
    let response = await requireNewPassword(email, res);
    try {
        console.log(response);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

function verifyEmail(token){
    //this method verifies the user email by confronting a token
}

export async function Delete(res, req){
    login = req.body.login;
    password = req.body.password;
    fingerprint = req.body.fingerprint;
    let returnValue = null;
    //this methods allow deletion of a user account after validating password
    await authenticate(login, password, '', fingerprint, async (err, ret) => {
        //remove from database and callback to feedback user in the UI
        if (ret.auth.success){
            const db = await dbl.connect();
            const status = await db.collection('users').updateOne({login: "login"}, {$set: {active: false}});
            try{
                returnValue = status;
            } catch(err) {
                console.error(err);
                returnValue = {success: false, state: "error", message: ERROR.DELETE_ERROR};
            }finally {
                db.close();
            }

        }else{
            retrunValue = {success: false, state: "error", message: ERROR.DELETE_ERROR};
        }
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(returnValue));
}

function create(args, callback){
    //this method adds a new user to the database
};

function isVerified(userId, callback){
    //this method makes sure the user has authorized his account via email
    return (true);
};
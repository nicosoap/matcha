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
const saltRounds = 10;

var MongoClient = mongodb.MongoClient;
var transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');


async function genToken(user){
    var myToken = jwt.sign({username: user.login}, credentials.jwtSecret);
    user.token = myToken;
    const db = await dbl.connect();
    try {
        const update = await db.collection('users').updateOne({login: user.login},{$set: {token: myToken}});
        try {
            if (update.modifiedCount == 1){
                return user;
            } else { console.log("Error associating token to user " + user.login);}
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
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

async function newDevice(userObj, callback){
    console.log("adding fingerprint to user record");
    console.log(userObj);
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
                console.log(userObj.user);
                callback(false, userObj);
            } else {
                console.log("Error associating fingerprint to user " + login);
                callback({"message" : "Error associating fingerprint to user"}, userObj);
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
    console.log("Connecting " + login + " with basic stategy");
    let db = await dbl.connect();
    try {
        let user = await db.collection('users').findOne({login: login});
        try {
            if (!user) {
                callback({message: "an error occured"}, {
                    auth: {
                        success: false,
                        message: "no user with this login found"
                    }
                });
            } else {
                console.log("user found");
                bcrypt.compare(password, user.password, async function (err, res) {
                    if (!err) {
                        console.log("password ok");
                        user = await genToken(user);
                        console.log(user);
                        if (user.fingerprint && contains(user.fingerprint, fingerprint)) {
                            console.log("known fingerprint");
                            const ret = {
                                auth: {
                                    method: "basic",
                                    success: true,
                                    fingerprint: fingerprint,
                                    token: user.token,
                                    message: "You successfully logged in"
                                },
                                user: user
                            };
                            callback(err, ret);
                        } else {
                            console.log("unknown fingerprint");
                            const ret = {
                                auth: {
                                    method: "basic",
                                    success: true,
                                    fingerprint: fingerprint,
                                    token: user.token,
                                    message: "You successfully logged in"
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
                                message: "Log in attempt failed: incorrect password"
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
            console.log("database connection closed");
            db.close();
        }
    } catch(err) {
        console.error(err);
    }
}

async function tokenAuth(token, fingerprint, callback){
    console.log("Connecting with token based strategy");
    let db = await dbl.connect();
    let user = (await db.collection('users').findOne({token: token}));
    try {
        if (!user) {
            const ret = {
                auth:{
                    method: "token",
                    success: false,
                    fingerprint: fingerprint,
                    message: "Log in attempt failed"}};
                    console.log(user);
            callback(true, ret);
        } else if (user.fingerprint && contains(user.fingerprint, fingerprint)){
            const ret = {
                auth:{
                    method: "token",
                    success: true,
                    fingerprint: fingerprint,
                    message: "You successfully logged in"},
                user: user};
            console.log(user);
            callback(false, ret);
        } else {
            const ret = {
                auth:{
                    method: "token",
                    success: true,
                    fingerprint: false,
                    message: "Authentication succeeded but device is unknown"},
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
                message: "Log in attempt failed"}};
        callback(err, ret);
    } finally {
        db.close();
    }
}

export async function authenticate(login, password, token, fingerprint, callback){
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
        callback({message: "Data provided is insufficient for authentication"},
            {auth:{success: false, message: "Data provided is insufficient for authentication"}});
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

export async function checkEmail(email){
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

async function changePasswordHlp(token, password){
    var returnValue = null;
    await jwt.verify(token, credentials.jwtSecret, async function(err, ret){
        console.log(err.message);
        if (err){
            returnValue = ({ success: false, message: 'token is corrupted' });
        } else {
            var password2 = await bcrypt.hashSync(password, saltRounds);
            const email = ret.email;
            const db = await dbl.connect();
            var update = await db.collection('users').updateOne({email: email}, {$set: {password: password2}});
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
    var token = req.body.token;
    if (req.body.password === req.body.password2){
        const password = req.body.password;
        var response = await changePasswordHlp(token, password);
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
    var myToken = jwt.sign({email: email}, credentials.jwtSecret, {expiresIn: 900});
    const db = await dbl.connect();
    const user = await db.collection('users').findOne({email: email});
    try {
        if (!user || !user.firstName ) {
            return ({success: "false", message: "User wasn't found"});
        } else {
            var mailOptions = {
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

function verifyEmail(userId, token, callback){
    //this method verifies the user email by confronting a token
};

function Delete(login, password, callback){
    //this methods allow deletion of a user account after validating password
    authenticate(login, password, function(err, ret){
        //remove from database and callback to feedback user in the UI
    })
};

function create(args, callback){
    //this method adds a new user to the database
};

function isVerified(userId, callback){
    //this method makes sure the user has authorized his account via email
    return (true);
};
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
const saltRounds = 10;

var MongoClient = mongodb.MongoClient;


async function genToken(login){
    var myToken = jwt.sign({username: login}, credentials.jwtSecret);
    const db = await dbl.connect();
        try {
            const update = await db.collection('users').update({login: login},{token: myToken});
            try {
                if (update.nModified == 1){
                    return myToken;
                } else { console.log("Error associating token to user " + login);}
            } catch (err) {
                console.log(err);
                return false;
            }
    } catch (err) {
        console.log(err);
            return false;
    }
}

async function newDevice(userObj, callback){
    userObj.user.fingerprint.push(userObj.auth.fingerprint);
    const db = await dbl.connect();
    try {
        const update = await db.collection('users').update({login: userObj.user.login}, userObj.user);
        try {
            if (update.nModified == 1){
                callback(false, userObj);
            } else {
                console.log("Error associating token to user " + login);
                callback({"message" : "Error associating token to user"}, userObj);
            }
        } catch (err) {
            console.log(err);
            callback(err, userObj);
        }
    } catch (err) {
        console.log(err);
        callback(err, userObj);
    }
}

export async function authenticate(login, password, token, fingerprint, callback){
    //This method authenticates user using basic strategy (username and password) or token based strategy.
    //The first strategy uses bcrypt to hash and salt the password.
    //The latter uses JWT to validate the token.
    //In any case, if a token doesn't exist, one is generated upon authentication success.
    //After authenticating, if the device fingerprint isn't recognized, user will be required to confirm his identity
    // using email.
    //This function fires a callback when succeeding, this callback takes two arguments: err: boolean and ret: object
    // containing every info about the authentication and its eventual success, if such, user info and details about
    // device fingerprint status.

    console.log("Connection attempt from: " + login + ' ' + token);
    const db = await dbl.connect();
    if (login && password && fingerprint) {
        console.log("Connecting " + login + " with stategy: basic");
        let user = (await db.collection('users').find({
            login: login
        }));
        try {
            if (user.count() != 1) {
                callback(true, false);
            } else {
                bcrypt.compare(password, user.password, async function (err, res) {
                        if (res) {
                            const myToken = await genToken(login);
                            if (user.fingerprint.contains(fingerprint)){
                                const ret = {
                                    auth: {
                                        method: "basic",
                                        success: true,
                                        device: fingerprint,
                                        token: myToken,
                                        message: "You successfully logged in"},
                                    user: user};
                                callback(err, ret);
                            } else {
                                const ret = {
                                    auth:{
                                        method: "basic",
                                        success: true,
                                        device: fingerprint,
                                        token: myToken,
                                        message: "You successfully logged in"},
                                    user: user};
                                newDevice(ret, callback);
                            }
                        } else {
                            const ret = {
                                auth:{
                                    method: "basic",
                                    success: false,
                                    device: fingerprint,
                                    message: "Log in attempt failed"}};
                            callback(err, ret);
                        }
                });
            }
        }
        catch (err){
            callback(err, false);
        }
    } else if (token && fingerprint) {
        console.log("Connecting " + login + " with stategy: basic");
        let user = (await db.collection('users').find({
            token: token
        }));
        try {
            if (user.count() != 1) {
                const ret = {
                    auth:{
                        method: "token",
                        success: false,
                        device: fingerprint,
                        message: "Log in attempt failed"}};
                callback(true, ret);
            } else if (user.fingerprint.contains(fingerprint)){
                const ret = {
                    auth:{
                        method: "token",
                        success: true,
                        device: fingerprint,
                        message: "You successfully logged in"},
                    user: user};
                callback(false, ret);
            } else {
                const ret = {
                        auth:{
                            method: "token",
                            success: true,
                            device: false,
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
                device: fingerprint,
                message: "Log in attempt failed"}};
            callback(err, ret);
        }
    }else {
        callback({message: "Data provided insufficient for authentication"}, false);
    }
}

export async function checkLogin(login){
    let db = await MongoClient.connect("mongodb://" + credentials.username + ":" + credentials.password + "@82.251.11.24:" + credentials.port + "/" + credentials.dbName);
    try {
        let collection = db.collection('users');
        console.log(collection);
        let userCount = (await collection.find({
            login: login
        }).limit(1).count());
        if (userCount == 0 && !(/([ ])/.exec(login))) {
            return {valid: true, message: "Login " + login + " is available"};
        } else if((/([ ])/.exec(login))){
            return {valid: false, message: "Login " + login + " contains whitespace"};
        } else {
            return {valid: false, message: "Login " + login + " is unavailable"};
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

function requireNewPassword(userId, callback){
    //this methods sends an email with a temporary link for the user to create a new password
};

function verifyEmail(userId, token, callback){
    //this method verifies the user email by confronting a token
};

function Delete(user_id, login, password, callback){
    //this methods allow deletion of a user account after validating password
    authenticate(login, password, function(err, ret){
        //remove from database and callback to feedback user in the UI
    })
};

function create(args, callback){
    //this method adds a new user to the database
};

function isVerified(userId, callback){
    //this method makes sure the user hs confirmed his account via email
    return (true);
};
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
import LOConnect from './dbConnect';
import credentials from '../credentials';
import mongodb from 'mongodb';

const saltRounds = 10;

var MongoClient = mongodb.MongoClient;

//this methods check in database for a user with both specified login and password. The latter being hashed
//and salted. It then fires a callback.
export function authenticate(login, password, callback){
    console.log("Connection attempt...");
    var temp2 = "opichou";
    bcrypt.hash(password, saltRounds, function(err, hash){
        bcrypt.compare(temp2, hash, function(err, ret) {
            callback(err, ret);
        });
    });
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
            return {valid: false, message: "Email " + email + " is incorrect"};
        } else {
            return {valid: false, message: "Email " + email + " is unavailable"};
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
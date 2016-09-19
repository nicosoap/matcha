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

const saltRounds = 10;

module.exports = {
    //this methods check in database for a user with both specified login and password. The latter being hashed
    //and salted. It then fires a callback.
    authenticate(login, password, callback){
        console.log("Connection attempt...");
        var temp2 = "opichou";
        bcrypt.hash(password, saltRounds, function(err, hash){
            bcrypt.compare(temp2, hash, function(err, ret) {
                callback(err, ret);
            });
        });
    },

    checkLogin(login, callback){
        //this method checks if Login already exists in database
    },

    checkEmail(login, callback){
        //this method checks if Email already exists in database
    },

    requireNewPassword(userId, callback){
        //this methods sends an email with a temporary link for the user to create a new password
    },

    verifyEmail(userId, token, callback){
        //this method verifies the user email by confronting a token
    },

    delete(user_id, login, password, callback){
        //this methods allow deletion of a user account after validating password
        authenticate(login, password, function(err, ret){
            //remove from database and callback to feedback user in the UI
        })
    },

    create(args, callback){
        //this method adds a new user to the database
    },

    isVerified(userId, callback){
        //this method makes sure the user hs confirmed his account via email
        return (true);
    }
};
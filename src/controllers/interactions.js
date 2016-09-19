/**
 * Created by opichou on 9/19/16.
 */
import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';

module.exports = {
    like(userId, otherId, callback){
        //this method logs a like from userId to otherId (being the other member's userId and fires callback
    },

    doesLike(userId, otherId, callback){
        //this method checks if a log entry exists for userId liking otherId and fires callback
    },

    match(userId, otherId, callback){
        //this method checks, giver two user ids if mutual likes exist and fires callback
        doesLike(userId, otherId, function(err, res){
            if(err){
                callback(err, false);
            } else if(res){
                doesLike(otherId, userId, function(err, res){
                    if(err) {
                        callback(err, false);
                    } else if (res){
                        callback(err, true);
                    } else {
                        callback(err, false);
                    }
                })
            } else {
                callback(err, false);
            }
        })
    }
};
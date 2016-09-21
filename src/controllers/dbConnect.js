/**
 * Created by opichou on 9/21/16.
 */
/**
 * Created by opichou on 9/19/16.
 */
import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
import mongodb from 'mongodb';
import credentials from '../credentials';
import dbc from "./dbConnect"
var async = require('async');

var MongoClient = mongodb.MongoClient;

module.exports = {
    LOConnect: async (callback) => {

        const db = await MongoClient.connect("mongodb://" + credentials.username + ":" + credentials.password +
            "@82.251.11.24:" + port + "/" + dbName);
        try {
            callback(db);
        } catch (err) {
            console.log(err);
        } finally {
            db.close();
        }
    }
}
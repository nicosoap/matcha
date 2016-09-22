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

var MongoClient = mongodb.MongoClient;

export default async function LOConnect(){
    try {
        let db = await MongoClient.connect("mongodb://" + credentials.username + ":" + credentials.password + "@82.251.11.24:" + port + "/" + dbName);
        console.log("Connected to database asynchronously");
    } finally {
        db.close();
    }
}
/**
 * Created by opichou on 9/21/16.
 */
/**
 * Created by opichou on 9/19/16.
 */
import express from 'express';
import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
import mongodb from 'mongodb';
import credentials from '../credentials';

var MongoClient = mongodb.MongoClient;

export async function connect(){
    var MongoClient = mongodb.MongoClient;
    return await MongoClient.connect("mongodb://" + credentials.username + ":" + credentials.password + "@liveoption.io:" + credentials.port + "/" + credentials.dbName);
}
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
    update(field, data, callback){
        //this methods updates the defined FIELD with the defined DATA and fires callback
    },

    upload(file, callback){
        //this method uploads a file to the server after verifying its mime type, extension and size. It the fires a
        //callback
    }
};
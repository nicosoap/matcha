// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   picture.js                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/19 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import fs from 'fs';
import session from 'express-session';
import bcrypt from 'bcrypt';
import * as dbl from "./dbConnect";
import credentials from '../credentials';
import mongodb from 'mongodb';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import ERROR from './errno_code';
import match from '../model/match';

async function registerPicture(login, filename, ext) {
    let payload = { user: login, filename: filename, ext: ext, active: true, date: Date.now() };
    console.log(payload);
    let db = await dbl.connect();
    try {
        return await db.collection('pictures').insertOne(payload);
    } finally {
        db.close();
    }
}

export async function uploadPicture(req, res) {
    console.log(req.file);
    const mimes = ["image/jpeg", "image/gif", "image/png"];
    let ext = req.file.originalname;
    console.log(ext);
    console.log(req.file.mimetype);
    if (mimes.indexOf(req.file.mimetype) != -1) {
        ext = ext.match(/.*(\.gif|\.png|\.jpg|\.jpeg)$/i)[1];
        console.log(ext);
        const result = await registerPicture(req.user.username, req.file.filename, ext);
        console.log(result);
        if (result.insertedCount === 1) {
            res.send({ success: true, message: ERROR.PICTURE_UPLOAD_SUCCESS });
        } else {
            res.send({ success: false, message: ERROR.PICTURE_REGISTER_ERROR });
        }
    } else {
        res.send({ success: false, message: ERROR.PICTURE_UPLOAD_ERROR });
    }
}

export async function deleteOne(req, res) {
    let login = req.user.username;
    let filename = req.body.filename;
    let db = await dbl.connect();
    try {
        return await db.collection('pictures').updateOne({ login: login, filename: filename, active: true }, { $set: { active: false } });
    } finally {
        db.close();
    }
}

export async function setAsDefault(req, res) {
    let login = req.user.username,
        filename = req.body.filename,
        db = await dbl.connect();
    try {
        db.collection('users').updateOne({ login: login }, { $set: { defaultPicture: filename } });
    } catch (e) {
        console.error(e);
    } finally {
        db.close();
    }
}
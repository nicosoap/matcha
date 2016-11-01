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

import fs from 'fs'
import session from 'express-session'
import bcrypt from 'bcrypt-nodejs'
import * as dbl from "./dbConnect"
import credentials from '../credentials'
import mongodb from 'mongodb';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import ERROR from './errno_code'
import match from '../model/match'

async function registerPicture(login, filename){
    let payload = {filename: filename, active: true, date: Date.now(), front: false }
    let db = await dbl.connect()
    try {
        return await db.collection('users').updateOne({login}, {
            $push: {
                photo: {
                    $each: [payload],
                    $position: 0,
                    $slice: 5}
            }
        }, {
                upsert: true
            })

    } catch (err) {console.error(err)
    } finally {
        db.close()
    }
}

async function registerPictureToDb(login, filename) {
    let payload = {filename: filename, active: true, date: Date.now(), login}
    let db = await dbl.connect()
    try {
        let res = await db.collection('photos').insert(payload)
        console.log(res)
        return filename

    } catch (err) {
        console.error(err)
    } finally {
        db.close()
    }
}

export async function uploadPicture(req, res){
    console.log(req.file)
    if (!req.file) {
        res.send({success: false, message: ERROR.PICTURE_UPLOAD_ERROR})
    }
    const mimes = ["image/jpeg", "image/gif", "image/png"]
    let ext = req.file.originalname
    if (mimes.indexOf(req.file.mimetype) != -1){
        ext = ext.match(/.*(\.gif|\.png|\.jpg|\.jpeg)$/i)[1]

            fs.rename(req.file.path, req.file.path + ext, (err) => {
                if (err) {console.error("ERROR: ", err)}
            })

        const result = await registerPictureToDb(req.user.username, req.file.filename + ext)

        if (result){
            console.log("success", result)
            res.send({success: true, message: ERROR.PICTURE_UPLOAD_SUCCESS, name: result})
        } else {
            console.log("failure", result)
            res.send({success: false, message: ERROR.PICTURE_REGISTER_ERROR})
        }
    }else{
        console.log("failure", result)
        res.send({success: false, message: ERROR.PICTURE_UPLOAD_ERROR})
    }
}

export async function deleteOne(req, res){
    let login = req.user.username
    let filename = req.body.filename
    let db = await dbl.connect()
    try {
        return await db.collection('pictures').updateOne({login: login, filename: filename, active: true}, {$set: {active: false}})
    } finally {
        db.close()
    }
}

export async function setAsDefault(req, res) {
    let login = req.user.username,
        filename = req.body.filename,
        db = await dbl.connect()
    try{
        db.collection('users').updateOne({login: login}, {$set: {defaultPicture: filename}})
    } catch (e) {
        console.error(e)
    }finally {
        db.close()
    }
}

export async function getAll(userId) {
    const db = await dbl.connect()
    try {
        const user = await db.collection('users').findOne({login: userId}, {photo: true})
        if (user.photo) {
            return user.photo
        } else {
            return ['girl.jpg']
        }
    } finally {
        db.close()
    }
}
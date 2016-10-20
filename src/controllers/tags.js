// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   user.js                                            :+:      :+:    :+:   //
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

let saltRounds = 10

let transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com')


function now(){
    const currentDate = new Date();
    return currentDate.getDate() + "/"+ ("0" + (currentDate.getMonth() + 1)).slice(-2)
        + "/" + currentDate.getFullYear() + " @ "
        + currentDate.getHours() + ":"
        + currentDate.getMinutes() + ":" + currentDate.getSeconds()
}

function contains(a, obj) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

export async function tags(req, res){
    let db = await dbl.connect()
    const _regex = '/.*' + req.query.tag + '.*/'
    let response = await db.colletion('tags').find({label: {$regex: _regex, $options: 'i'}}).sort({count: desc})
    res.send({response})
}

export async function addTag(req, res){
    let tags = await req.body.tags
    if (tags === ''){console.log({status: "ok", tagsCreated: 0})}
    const db = await dbl.connect()
    try{
        let bulk = await db.collection('tags').initializeUnorderedBulkOp()
        await tags.filter((n) => n != '').forEach(async(n) => {
            bulk.find({label: n}).upsert().updateOne({$inc: {count: 1}})
        })
        const result = await bulk.execute({w:1})
        console.error(result)
    } finally {
        db.close()
    }
}
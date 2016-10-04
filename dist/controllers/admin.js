// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   admin.js                                           :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: opichou <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2016/09/29 18:27:53 by opichou           #+#    #+#             //
//   Updated: 2016/09/29 18:27:53 by opichou          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import fs from 'fs';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
import bcrypt from 'bcrypt';
import * as dbl from "./dbConnect";
import credentials from '../credentials';
import mongodb from 'mongodb';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import ERROR from './errno_code';
import match from '../model/match';
let saltRounds = 10;

let transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');

export async function addFormItems(req, res) {
    if (req.user.username === 'olivier') {
        let label = req.body.label;
        let dataType = req.body.dataType;
        switch (dataType) {
            case "text":
                break;
            case "bigText":
                break;
            case "option":
                var optionList = req.body.optionList.filter(n => {
                    return n != '';
                });
                break;
            case "imageField":
                var multiInput = req.body.multiInput;
                break;
        }
        let formItem = { label: label, dataType: dataType, optionList: optionList, multiInput: multiInput };
        let db = await dbl.connect();
        let response = await db.collection('profileItems').addOne(formItem);
        try {
            res.send(response);
        } finally {
            db.close();
        }
    } else {
        res.redirect('/');
    }
}
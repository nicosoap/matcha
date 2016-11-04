/**
 * Created by opichou on 11/4/16.
 */

import fs from 'fs'
import session from 'express-session'
import bcrypt from 'bcrypt-nodejs'
import * as dbl from "./dbConnect"
import credentials from '../credentials'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import ERROR from './errno_code'
import match from '../model/match'
import crypto from 'crypto'
import * as user from './user'
import findAll from '../model/findAll'
import popularity from '../model/popularity'




module.exports = (io) => {


    let self = {

        interactions: require('./interactions')(io),

        chats: async(req, res) => {
            let userId = req.user.username
            let db = await dbl.connect()
            try {
                let chats = db.collection('chats').find({$or: [{userId}, {otherId: userId}]}).toArray()
                res.send({success: true, message: ERROR.CHAT_SUCCESS, chats})
            } finally {
                db.close()
            }
        },

        chat: async(req, res) => {
            let userId = req.user.username
            let otherId = req.body.otherId
            let body = req.body.body
            let from = req.body.from
            const message = {body, from}
            let rslt = await insertChat(userId, otherId, message)
            res.send(rslt)
        },

        insertChat: async(userId, otherId, message) => {
            let db = await dbl.connect()
            try {
                let match = await interactions.match(userId, otherId)
                if (match) {
                    let chatExists = await db.collection('chats').find({
                        $or: [{userId, otherId}, {
                            userId: otherId,
                            otherId: userId
                        }]
                    }).count
                    if (chatExists === 1) {
                        let rslt = await db.collection('chats').update({
                            $or: [{userId, otherId}, {
                                userId: otherId,
                                otherId: userId
                            }]
                        }, {
                            $push: {
                                messages: {
                                    $each: [message]
                                }
                            }
                        }, {upsert: true})
                        if (rslt.nModified != 0) {
                            return ({success: true, message: ERROR.CHAT_SUCCESS})
                        } else {
                            return ({success: false, message: ERROR.CHAT_FAILURE})
                        }
                    } else if (chatExists === 2) {
                        let one = await db.collection('chats').findOne({otherId: userId, userId: otherId})
                        await db.collection('chats').update({userId, otherId}, {
                            $push: {
                                messages: {
                                    each: [...one.messages]
                                }
                            }
                        })
                        let rslt = await db.collection('chats').update({
                            userId, otherId
                        }, {
                            $push: {
                                messages: {
                                    $each: [message]
                                }
                            }
                        }, {upsert: true})
                        if (rslt.nModified != 0) {
                            return ({success: true, message: ERROR.CHAT_SUCCESS})
                        } else {
                            return ({success: false, message: ERROR.CHAT_FAILURE})
                        }
                    } else if (chatExists === 0) {
                        let rslt = await db.collection('chats').insert({
                            userId, otherId, messages: [message]
                        })
                        if (rslt.nModified != 0) {
                            return ({success: true, message: ERROR.CHAT_SUCCESS})
                        } else {
                            return ({success: false, message: ERROR.CHAT_FAILURE})
                        }
                    }

                } else {
                    return ({success: false, message: ERROR.CHAT_FAILURE})
                }
            } catch (err) {
                console.error(err)
            } finally {
                db.close()
            }
        }
    }
    return self
}

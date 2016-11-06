/**
 * Created by opichou on 9/19/16.
 */
import express from 'express'
import fs from 'fs'
import parseurl from 'parseurl'
import bodyParser from 'body-parser'
import session from 'express-session'
import socketIo from 'socket.io'
import * as picture from './picture'
import chalk from 'chalk'
import ERROR from './errno_code'
import * as dbl from './dbConnect'
import config from '../config.json'



module.exports = (io) => {


    let self = {

        now: () => {
            const currentDate = new Date();
            return currentDate.getDate() + "/" + ("0" + (currentDate.getMonth() + 1)).slice(-2)
                + "/" + currentDate.getFullYear() + " @ "
                + currentDate.getHours() + ":"
                + currentDate.getMinutes() + ":" + currentDate.getSeconds()
        },

        sendNotif: async(login, type, payload) => {
            const db = await dbl.connect()
            try {
                const ret = await db.collection('connections').findOne({login}, {socket: true})
                const socket = ret.socket
                io.sockets.connected[socket].emit(type, payload)
            } finally {
                db.close()
            }
        },

        connect: async(login, socket) => {
            const db = await dbl.connect()
            try {
                const currentDate = new Date()
                await db.collection('connections').updateOne({login}, {
                    $set: {
                        socket,
                        connected: true,
                        date: currentDate
                    }
                }, {upsert: true})
                if (config.debug) {
                    self.sendNotif(login,
                        config.debug_output,
                        {
                            body: "Connected to Matcha Server on " + self.now()})
                    console.log("BEBUG: user connected and notified as " + config.debug_output + ".")
                }
            } finally {
                db.close()
            }
        },

        disconnect: async(login) => {
            const db = await dbl.connect()
            try {
                currentDate = new Date()
                await db.collection('connections').updateOne({login}, {
                    $set: {
                        connected: false,
                        date: currentDate
                    }
                }, {upsert: true})
            } finally {
                db.close()
            }
        },

        _his: (user) =>{
            if (user.gender === 'male') { return'his'} else if (user.gender === 'female') { return 'her'} else { return 'their'}
        },
        _him: (user) =>{
            if (user.gender === 'male') { return 'him'} else if (user.gender === 'female') { return 'her'} else {return 'them'}
        },

        photo: user => { if (user.photo.length > 0) {
            return (user.photo[0])
        }},



        like: async(req, res) => {
            console.log('like')
            const userId = req.user.username,
                otherId = req.params.userId
            let db = await dbl.connect()
            try {
                await db.collection('likes').updateOne({userId, otherId}, {$set: {like: true}}, {upsert: true})
                let user = await db.collection('users').findOne({login: userId})
                let user2 = await db.collection('users').findOne({login: otherId})
                let match = await self.doesLike(db, otherId, userId)
                if (match) {
                    self.newChat(db, userId, otherId)
                    const body = userId + ' and you matched ! You can now chat with ' + self._him(user) + '.'
                    const body2 = otherId + ' and you matched ! You can now chat with ' + self._him(user2) + '.'
                    console.log('match')
                    self.sendNotif(otherId, 'match', {
                        body,
                        from: userId,
                        image:self.photo(user),
                        read: false
                    })
                    self.sendNotif(userId, 'match', {
                        body2,
                        from: otherId,
                        image: self.photo(user2),
                        read: false
                    })
                    res.send({success: true, match: true})
                } else {
                    res.send({success: true, match: false})
                    if (config.debug) {
                        self.sendNotif(userId, config.debug_output, {
                            body: "Like notification has been sent to " + otherId + ".",
                            from: userId,
                            image:self.photo(user),
                            read: false
                        })
                    }
                    const body = userId + ' is interested in you. Check out ' + self._his(db, userId) + ' profile!'
                    self.sendNotif(otherId, 'like', {
                        body,
                        from: userId,
                        image:self.photo(user),
                        read: false
                    })
                }
            } finally {
                db.close()
            }
        },

        dislike: async(req, res) => {
            const userId = req.user.username,
                otherId = req.params.userId
            console.log(userId, otherId)
            let db = await dbl.connect()
            try {
                db.collection('likes').updateOne({userId, otherId}, {$set: {like: false}}, {upsert: true})
                let user = await db.collection('users').findOne({login: userId})
                res.send({success: true})
                const body = userId + ' is not THAT into you after all. Deal with it!'
                if (config.debug) {
                    self.sendNotif(userId, config.debug_output, {
                        body: "dislike notification has been sent to " + otherId + ".",
                        from: userId,
                        image:self.photo(user),
                        read: false
                    })
                }
                self.sendNotif(otherId, 'like', {
                    body,
                    from: userId,
                    image:self.photo(user),
                    read: false
                })
            } catch (err) {
                console.log(err)
            } finally {
                db.close()
            }
        },

        block: async(req, res) => {
            const userId = req.user.username,
                otherId = req.params.userId
            const db = await dbl.connect()
            try {
                await db.collection('blocks').upsert({userId, otherId}, {$set: {block: true}})
                res.send({success: true})
            } finally {
                db.close()
            }
        },

        doesLike: async(db, userId, otherId) => {
            //this method checks if a log entry exists for userId liking otherId and fires callback
            try {
                return (await db.collection('likes').find({userId, otherId, like: true}).count() === 1)
            } catch(err){
                console.error(err)
            }
        },

        match: async(db, userId, otherId) => {
            //this method checks, giver two user ids if mutual likes exist and fires callback
            return (await self.doesLike(db, userId, otherId)
            && await self.doesLike(db, otherId, userId))
        },

        chats: async (req, res) => {
            let userId = req.user.username
            let db = await dbl.connect()
            try {
                await db.collection('chats').find({$or: [{userId}, {otherId: userId}]}).toArray((err, chats) => {
                    res.send({success: true, message: ERROR.CHAT_SUCCESS, chats})
                })
            } catch(err) {
                console.log(err)
            } finally {
                db.close()
            }
        },

        newChat: (db, userId, otherId) => {
            let err = {}
            try {
                let users = db.collection('users').find({$or:[{login: userId}, {login: otherId}]}).toArray((error, results) => {
                    results.forEach(e => {  if (!e.active) {
                        err.users = true;
                        console.log("couldn't initialize chat for "+ userId + " and " + otherId + " --- value = " + e)
                    }})

                })
                if (!err.users) {
                    db.collection('chats').insertOne({userId, otherId})
                    self.sendNotif(userId,'chatroom',{userId, otherId, messages: []})
                    self.sendNotif(otherId,'chatroom',{userId, otherId, messages: []})
                }
            } catch(err){
                console.error(err)
            }
        },

        chat: async (from, to, body) => {
            console.log("New message from " + from + " to " + to + " : " + body)
            const message = {from, to, body}
            let rslt = await self.insertChat(from, to, message)
            self.sendNotif(from, 'message', message)
            self.sendNotif(to, 'message', message)
            res.send(rslt)
        },

        insertChat: async (userId, otherId, message) => {
            let db = await dbl.connect()
            try {
                let match = await self.match(db, userId, otherId)
                if (match) {
                    let chatExists = await db.collection('chats').find({
                        $or: [{userId, otherId}, {
                            userId: otherId,
                            otherId: userId
                        }]
                    }).count()
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
                    } else if (chatExists > 1) {
                        while (chatExists > 1) {
                            let one = await db.collection('chats').findOneAndRemove({otherId: userId, userId: otherId})
                            await db.collection('chats').update({
                                $or: [{userId, otherId}, {
                                    userId: otherId,
                                    otherId: userId
                                }]
                            }, {
                                $push: {
                                    messages: {
                                        each: [...one.messages]
                                    }
                                }
                            })
                            chatExists = await db.collection('chats').find({
                                $or: [{userId, otherId}, {
                                    userId: otherId,
                                    otherId: userId
                                }]
                            }).count()
                        }

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
                    } else {
                        console.log("please check database collection 'chats' form hand created duplicates")
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
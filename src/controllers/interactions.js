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
import * as dbl from './dbConnect'
import config from '../config.json'
// var io = require('socket.io-emitter')({host:'localhost', port:3001})
// setInterval(function(){
//     io.emit('time', new Date)
// }, 5000)

// const io = socketIo(server)



module.exports = (io) =>{


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

        disconnect: async(login, socket) => {
            const db = await dbl.connect()
            try {
                currentDate = new Date()
                await db.collection('connections').updateOne({login}, {
                    $set: {
                        socket,
                        connected: false,
                        date: currentDate
                    }
                }, {upsert: true})
            } finally {
                db.close()
            }
        },

        _his: (user) =>{
            let _his = 'their'
            if (user.gender === 'male') { _his = 'his'} else if (user.gender === 'female') { _his = 'her'}
        },

        photo: user => {return (user.photo.filter(e => {e.front})[0].filename)},



        like: async(req, res) => {
            console.log('like')
            const userId = req.user.username,
                otherId = req.params.userId
            let db = await dbl.connect()
            try {
                await db.collection('likes').updateOne({userId, otherId}, {$set: {like: true}}, {upsert: true})
                let user = await db.collection('users').findOne({login: userId})
                let user2 = await db.collection('users').findOne({login: otherId})
                let match = await self.doesLike(otherId, userId)
                if (match) {
                    res.send({success: true, match: true})
                    const body = userId + ' and you matched ! You can now chat with ' + self._him(user) + '.'
                    const body2 = otherId + ' and you matched ! You can now chat with ' + self._him(user2) + '.'

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
            } catch (err) {
                console.log(err)
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

        doesLike: async(userId, otherId) => {
            //this method checks if a log entry exists for userId liking otherId and fires callback
            const db = await dbl.connect()
            try {
                return (db.collection('likes').find({userId, otherId, like: true}).count() === 1)
            } finally {
                db.close()
            }
        },

        match: async(userId, otherId) => {
            //this method checks, giver two user ids if mutual likes exist and fires callback
            return (await self.doesLike(userId, otherId)
            && await self.doesLike(otherId, userId))
        }
    }
    return self
}
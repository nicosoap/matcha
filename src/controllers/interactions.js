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
                    self.sendNotif('opichou', 'like', {body: "Connected to Matcha Server on " + self.now()})
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
        }


///
        ///
        ///
        ///                     ATTENTION CETTE FONCTION ENVOIE UN MESSAGE A L'EMMETEUR ET DEVRAIT L'ENVOYER AU DESTINATAIRE
        ///
        ///

        //this method logs a like from userId to otherId (being the other member's userId and fires callback
        like: async(req, res) => {
            const userId = req.user.username,
                otherId = req.params.userId
            let db = await dbl.connect()
            let photo = await picture.getAll(userId)
            let photo2 = await picture.getAll(otherId)
            try {
                await db.collection('likes').updateOne({userId, otherId}, {$set: {like: true}}, {upsert: true})
                const user = await db.collection('users').findOne({login: userId})
                const user2 = await db.collection('users').findOne({login: otherId})
                if (await this.doeslike(otherId, userId)) {
                    res.send({success: true, match: true})
                    const body = userId + ' and you matched ! You can now chat with ' + self._him(user) + '.'
                    const body2 = otherId + ' and you matched ! You can now chat with ' + self._him(user2) + '.'

                    this.sendNotif(otherId, 'match', {
                        body,
                        from: userId,
                        image: photo[0],
                        read: false
                    })
                    this.sendNotif(userId, 'match', {
                        body2,
                        from: otherId,
                        image: photo2[0],
                        read: false
                    })
                } else {
                    res.send({success: true, match: false})
                    if (config.debug) {
                        self.sendNotif('opichou', 'like', {
                            body,
                            from: userId,
                            image: photo[0],
                            read: false
                        })
                    }
                    const body = userId + ' is interested in you. Check out ' + self._his(db, userId) + ' profile!'
                    this.sendNotif(otherId, 'like', {
                        body,
                        from: userId,
                        image: photo[0],
                        read: false
                    })
                }
            } catch (err) {
                console.log(err)
            } finally {
                db.close()
            }
        },

///
        ///
        ///
        ///                     ATTENTION CETTE FONCTION ENVOIE UN MESSAGE A L'EMMETEUR ET DEVRAIT L'ENVOYER AU DESTINATAIRE
        ///
        ///
        dislike: async(req, res) => {
            const userId = req.user.username,
                otherId = req.params.userId
            console.log(userId, otherId)
            let db = await dbl.connect()
            try {
                db.collection('likes').updateOne({userId, otherId}, {$set: {like: false}}, {upsert: true})
                res.send({success: true})
                const body = userId + ' is not THAT into you after all. Deal with it!'
                this.sendNotif(userId, 'like', {
                    body,
                    from: userId,
                    image: photo[0],
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
            //this method logs a like from userId to otherId (being the other member's userId and fires callback
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
            return (await doesLike(userId, otherId)
            && await doesLike(otherId, userId))
        }
    }
    return self
}
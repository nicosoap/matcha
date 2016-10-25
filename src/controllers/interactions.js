/**
 * Created by opichou on 9/19/16.
 */
import express from 'express'
import fs from 'fs'
import parseurl from 'parseurl'
import bodyParser from 'body-parser'
import session from 'express-session'
import * as dbl from './dbConnect'

module.exports = {
    connect: async (login, socket) => {
        const db = await dbl.connect()
        try {
            currentDate = new Date()
            await db.collection('connections').updateOne({login}, {$set: {socket, connected: true, date: currentDate}}, {upsert: true})
        } finally {
            db.close()
        }
    },

    disconnect: async (login, socket) => {
        const db = await dbl.connect()
        try {
            currentDate = new Date()
            await db.collection('connections').updateOne({login}, {$set: {socket, connected: false, date: currentDate}}, {upsert: true})
        } finally {
            db.close()
        }
    },

    like: async (req, res) => {
        const userId = req.user.username,
            otherId = req.params.userId
        console.log(userId, otherId)
        //this method logs a like from userId to otherId (being the other member's userId and fires callback
        const db = await dbl.connect()
        try {
            db.collection('likes').upsert({userId, otherId}, {$set: {like: true}})
            res.send({success: true})
            if (this.doeslike(userId, otherId)) {
                // socket.io match
            }
        } finally {
            db.close()
        }
    },

    block: async (req, res) => {
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

    match: async (userId, otherId) => {
        //this method checks, giver two user ids if mutual likes exist and fires callback
        return (await doesLike(userId, otherId)
            && await doesLike(otherId, userId))
    }
}
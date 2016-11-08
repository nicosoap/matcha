
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
import geolib from 'geolib'


let saltRounds = 10

let transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com')


function now(){
    const currentDate = new Date();
    return currentDate.getDate() + "/"+ ("0" + (currentDate.getMonth() + 1)).slice(-2)
        + "/" + currentDate.getFullYear() + " @ "
        + currentDate.getHours() + ":"
        + currentDate.getMinutes() + ":" + currentDate.getSeconds()
}

const encrypt = async message => {
    let encrypted = await crypto.createHmac('sha256', credentials.cookieSecret)
        .update(message, 'utf8', 'hex')
        .digest('hex')
    return encrypted
}

const decrypt = async text => {
    let decipher = crypto.createDecipher('sha256', credentials.cookieSecret)
    let dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


export const All = async (req, res) => {
    const tic = new Date()

    let query = {
            netflix: false,
            rightnow: false,
            age:{
                min:18,
                max: 77
            },
            popularity: {
                min: 0,
                max: 100
            },
            geocode: {
                lat: 0,
                lng: 0
            },
            tags: [],
            custom: ''
        },
        regexExperimentalAge = /([0-9]{2})? ?(?:to)? ?([0-9]{2}) ?(?:yo|years)/i,
        regexExperimentalLocation = /(?:within|in|around|closer than)(?: about|) ?([0-9]{1,3}) ?(miles|km|m|meters|feet|minutes|min)/i,
        regexExperimentalPerfect = /perfect/i,

        regexHashtag = /#([a-zA-Z0-9-]*)+/g,
        regexNetflix = /netflix/i,
        regexRightNow = /rightnow/i,
        regexAge = /age-from=([0-9]{1,2}).*age-to=([0-9]{1,2})/i,
        regexAgeMin = /age-from=[0-9]{1,2}/i,
        regexAgeMax = /age-to=[0-9]{1,2}/i,
        regexPopularity = /popularity-from=([0-9]{1,2}).*popularity-to=([0-9]{1,3})/i,
        regexPopularityMin = /popularity-from=[0-9]{1,2}/i,
        regexPopularityMax = /popularity-to=[0-9]{1,3}/i,
        regexGeocode = /around-lat=(-?[0-9]{1,2}\.?[0-9]{0,16}).*around-lng=(-?[0-9]{1,2}\.?[0-9]{0,16})/i,
        regexGeocodeLat = /around-lat=-?[0-9]{1,2}\.?[0-9]{0,16}/i,
        regexGeocodeLng = /around-lng=-?[0-9]{1,2}\.?[0-9]{0,16}/i,

        queryStr = req.query.query || ''

    query.netflix = regexNetflix.test(queryStr)
    query.rightnow = regexRightNow.test(queryStr)
    const age = regexAge.exec(queryStr)

    if (age) {
        query.age.min = age[1]
        query.age.max = age[2]
    }

    const popularity = regexPopularity.exec(queryStr)

    if (popularity) {
        query.popularity.min = popularity[1]
        query.popularity.max = popularity[2]
    }

    const geocode = regexGeocode.exec(queryStr)

    if (geocode) {
        query.geocode.Lat = geocode[1]
        query.geocode.Lng = geocode[2]
    }

    //experimental queries
    const unitMap = {
        miles: 1609.34,
        km: 1000,
        m: 1,
        meters: 1,
        feet: 0.3048,
        minutes : 84,
        min : 80
    }

    if (!query.age) {
        const experimentalAge = regexExperimentalAge.exec(queryStr)
        if (experimentalAge) {
            query.age.min = experimentalAge[1]
            query.age.max = experimentalAge[2]
        }
    }
    if (!query.geocode) {
        const experimentalLocation = (parseInt(regexExperimentalLocation.exec(queryStr)[1])) * parseInt(unitMap[regexExperimentalLocation.exec(queryStr)[2]])
        if (experimentalLocation) {
            query.geocode.distance = parseInt(experimentalLocation[1]) * parseInt(unitMap[experimentalLocation[2]])

        }
    }
    query.perfect = regexExperimentalPerfect.test(queryStr)

    let i = 0,
        temp = []
    while ((temp = regexHashtag.exec(queryStr)) !== null) {
        query.tags[i] = temp[1]
        i++
    }
    query.custom = queryStr.replace(regexGeocodeLng, '')
        .replace(regexGeocodeLat, '')
        .replace(regexPopularityMax, '')
        .replace(regexPopularityMin, '')
        .replace(regexAgeMax, '')
        .replace(regexAgeMin, '')
        .replace(regexRightNow, '')
        .replace(regexNetflix, '')
        .replace(regexHashtag, '')
        .replace(regexExperimentalAge, '')
        .replace(regexExperimentalLocation, '')
        .replace(regexExperimentalPerfect, '')
        .replace(/ (?: *)/, ' ')
        .split(' ')
        .filter(e => e !== '')

    console.log("query parsed within " + (new Date() - tic) + "ms")
    let search = await findAll(req.user.username, query)
    res.send({success: true, users: search})

}

export const One = async (req, res) => {
    const login = req.params.userId
    const me = req.user.username
    let db = await dbl.connect()
    try {
        let user = null
        if (login === me) {
            user = await db.collection('users').findOne({login, active: true}, {
            password: false,
            fingerprint: false,
            token: false,
            _id: false,
            Lat: false,
            Lng: false
        })} else {
            let block = db.collection('blocks').findOne({$or: [{login}, {login: me}]})
            if (block.length === 0) {
                user = await db.collection('users').findOne({login, active: true}, {
                    password: false,
                    token: false,
                    fingerprint: false,
                    email: false,
                    firstName: false,
                    lastName: false,
                    _id: false,
                    Lat: false,
                    Lng: false
                })
                const date = new Date()
                await db.collection('visits').insert({userId: me, otherId: login, visit: true, date})
            } else {
                res.send({success: false})
            }
        }
        if (user) {
            user.email = (login === me)? user.email:''
            let liked = await db.collection('likes').findOne({userId: me, otherId: login, likes: true})
            let likes_me = await db.collection('likes').findOne({userId: login, otherId: me, likes: true})
            let connection = await db.collection('connections').findOne({login})
            let visited = await db.collection('visits').findOne({userId:login, otherId: me})
            let var_popularity = await popularity(login)
            await db.collection('visits').insertOne({userId: me, otherId: login, visit: true, date: new Date()})
            res.send({
                success: true,
                user,
                liked: !!liked,
                likes_me: !!likes_me,
                connected: connection.connected,
                lastConnection: connection.date,
                visited: !!visited,
                popularity: var_popularity
            })
        } else {
            res.send({success: false})
        }
    } catch(err) {
        console.error(err)
    } finally{
        db.close()
    }
}

export const me = async (req,res) => {
    const login = req.user.username
    let db = await dbl.connect()
    try {
        let user = await db.collection('users').findOne({login, active: true})
        if (user) {
            res.send({success: true, login: req.user.username})
        } else {
            res.send({success: false, message: ERROR.AUTH_ERROR})
        }
    } finally {
        db.close()
    }

}

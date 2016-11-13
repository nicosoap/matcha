/**
 * Created by opichou on 11/3/16.
 */

import * as dbl from "../controllers/dbConnect"
import chalk from 'chalk'
import popularity from './popularity'
import match from './match'
import config from '../config.json'
import async from 'async'


//new Date(new Date('1995-12-12') - 1000*3600*24*365.25*18)


const findAll = async(login, request) => {
    let order_id = 0
    try {

        if (config.debug) {
            console.log(chalk.red('entering search model for ' + login))
        }
        const tic = new Date()
        let res_length = 0
        let db = await dbl.connect()
        let user = await db.collection('users').findOne({login, active: true})
        if (!user) {
            return ([])
        }
        if (config.debug) {
            console.log(chalk.red('extrapolation of search criterions for ' + login))
        }
        let query = {}
        query.active = true
        if (config.debug) {
            console.log(chalk.red('fetching database collections for ' + login))
        }

        let liked = await db.collection('likes').find().toArray()
        let blocs = await db.collection('blocks').find({$or: [{userId: login}, {otherId: login}]}).toArray()
        let connections = await db.collection('connections').find().toArray()
        let visits = await db.collection('visits').find().toArray()
        let users = await db.collection('users').count()
        let chats = await db.collection('chats').find().toArray()

        if (user.gender === 'female') {
            query.attractedByFemale = true
        } else if (user.gender === 'other') {
            query.attractedByOther = true
        } else if (user.gender === 'male') {
            query.attractedByMale = true
        }

        let gender = []
        if (!!user.attractedByFemale) {
            gender.push({gender: 'female'})
        }

        if (!!user.attractedByMale) {
            gender.push({gender: 'male'})
        }
        if (!!user.AttractedByOther) {
            gender.push({gender: 'other'})
        }
        if (!user.AttractedByOther && !user.attractedByMale && !user.attractedByFemale) {
            gender.push({gender: 'female'})
            gender.push({gender: 'male'})
            gender.push({gender: 'other'})
        }

        let resultats = await db.collection('users').find({
            $or: gender,
            ...query
        }, {
            password: false,
            fingerprint: false,
            email: false,
            token: false,
            _id: false
        }).toArray()
        res_length = resultats.length


        let result = resultats.map(doc => {

            if ((doc.login !== login) && (blocs.filter(e => {
                    return ((e.userId === doc.login) || (e.otherId === doc.login))
                }).length === 0)) {
                let res_user = {...doc}

                res_user.liked = (liked.filter(e => {
                    return (e.otherId === doc.login && e.userId === login)
                }).length > 0)


                res_user.likes_me = (liked.filter(e => {
                    return (e.userId === res_user.login && e.otherId === login)
                }).length > 0)


                let connect = connections.filter(e => {
                    return (e.login === res_user.login)
                })


                if (connect.length > 0) {
                    res_user.lastConnection = connect[0].date
                    res_user.connected = connect[0].connected
                } else {
                    res_user.lastConnection = 0
                    res_user.connected = false
                }

                res_user.visited = (visits.filter(e => {
                    return (e.userId === res_user.login && e.otherId === login)
                }).length > 0)


                res_user.matchingRate = match(user, doc, query)


                res_user.popularity = popularity(res_user.login, liked, visits, users, chats)
                res_user.key_id = order_id++


                return res_user
            } else {
                return null
            }
        })

        result = result.filter(e => {
            return e !== null
        })

        console.log(chalk.black.bgBlue('findAll request successfully executed in '
            + (new Date() - tic) + ' ms. with ' + result.length + ' results out of '
            + res_length + ' candidates'
        ))


        result = result.sort((a, b) => {
            return b.matchingRate - a.matchingRate
        })


        return result
    } catch (err) {
        console.log("findAll errors: ", err)
    }

}

export default findAll
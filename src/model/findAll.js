/**
 * Created by opichou on 11/3/16.
 */

import * as dbl from "../controllers/dbConnect"
import chalk from 'chalk'
import popularity from './popularity'
import match from './match'


const findAll = async(login, request) => {
    const tic = new Date()
    let res_length = 0,
        result = [],
        db = await dbl.connect()
    try {

        let user = await db.collection('users').findOne({login, active: true})
        if (user) {
            console.log(user)
            let query = {}
            query.active = true

//new Date(new Date('1995-12-12') - 1000*3600*24*365.25*18)


            let blocs = await db.collection('blocks').find({$or: [{userId: login}, {otherId: login}]}).toArray()
            let liked = await db.collection('likes').find({userId: login}).toArray()
            let likes_me = await db.collection('likes').find({otherId: login}).toArray()
            let connections = await db.collection('connections').find().toArray()
            let visits = await db.collection('visits').find({otherId: login}).toArray()

            if (user.gender === 'female'){
                    query.attractedByFemale = true
            } else if (user.gender === 'other') {
                query.attractedByOther = true
            } else if (user.gender === 'male'){
                query.attractedByMale = true
            }

            console.log("lookin male",attractedByMale,'female', attractedByFemale, 'other', attractedByOther)

            let gender = []
            if (!!user.attractedByFemale) {
                gender.push({gender: 'female'})
            }

            if (!!user.attractedByMale) {
                gender.push({gender: 'male'})
            }
            if (!!user.AttractedByOther) {
                gender.push({gender : 'other'})
            }

            let resultats = await db.collection('users').find({
                $or: gender,
                ...query
            }, {
                password: false,
                fingerprint: false,
                email: false,
                token: false
            }).toArray()
            res_length = resultats.length
            if (res_length !== 0) {
                await resultats.map( async doc => {
                    if ((doc.login !== login) && (blocs.filter(e => {
                            return ((e.userId === doc.login) || (e.otherId === doc.login))
                        }).length === 0)) {
                        let user = {...doc}


                        user.liked = (liked.filter(e => {
                            return (e.otherId === doc.login)
                        }).length > 0)


                        user.likes_me = (likes_me.filter(e => {
                            return (e.userId === doc.login)
                        }).length > 0)


                        let connect = connections.filter(e => {
                            return (e.login === user.login)
                        })


                        if (connect.length > 0) {
                            user.lastConnection = connect[0].date
                            user.connected = connect[0].connected
                        } else {
                            user.lastConnection = 0
                            user.connected = false
                        }


                        user.visited = await (visits.filter(e => {
                            return (e.userId === doc.login)
                        }).length > 0)

                        user.matchingRate = match(user, doc, query)

                        user.popularity = await popularity(doc.login)

                        result.push(user)
                    }

                })
            }
        }

        console.log(chalk.black.bgBlue('findAll request successfully executed in '
            + (new Date() - tic) + ' ms. with ' + (result.length) + ' results out of '
            + res_length + ' candidates'
        ))

        return result.sort((a, b) => {
            return b.matchingRate - a.matchingRate
        })

    } catch (err) {
        return (err)
    } finally {
        db.close()
    }

}

export default findAll
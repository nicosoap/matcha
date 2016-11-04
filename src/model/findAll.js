/**
 * Created by opichou on 11/3/16.
 */

import * as dbl from "../controllers/dbConnect"
import chalk from 'chalk'
import popularity from './popularity'


const distance = (userId, otherId) => {
    return ((userId.Lat - otherId.Lat) ** 2 + (userId.Lng + otherId.Lng) ** 2) ** 0.5
}

const findAll = async login => {
    let result = []
    const tic = new Date()
    let db = await dbl.connect()
    try {
        let user = await db.collection('users').findOne({login, active: true})
        if (user) {
            let query = {}
            query.active = true
            if (!!user.gender) {
                query.attractedByMale = (user.gender === 'male')
                query.attractedByFemale = (user.gender === 'female')
                query.attractedByOther = (user.gender === 'other')
            }
            if (!!user.attractedByFemale || !!user.attractedByMale || !!user.AttractedByOther) {
                query.gender = (user.attractedByMale ? 'male' : (user.attractedByFemale ? 'female' : 'other'))
            }
            let blocs = await db.collection('blocks').find({$or: [{userId: login}, {otherId: login}]}).toArray()
            let liked = await db.collection('likes').find({userId: login}).toArray()
            let likes_me = await db.collection('likes').find({otherId: login}).toArray()
            let connections = await db.collection('connections').find().toArray()
            let visits = await db.collection('visits').find({otherId: login}).toArray()
            let resultats = await db.collection('users').find(query).toArray()
            result = await resultats.map( doc => {
                if ((doc.login !== login) &&(blocs.filter(async e => {
                        return ((e.userId === doc.login) || (e.otherId === doc.login))
                    }).length === 0)) {
                    let user = {...doc}
                    user.liked = (liked.filter(e => {
                        return (e.otherId === doc.login)
                    }).length > 0)
                    user.likes_me = (likes_me.filter(async e => {
                        return (e.userId === doc.login)
                    }).length > 0)
                    let connect = connections.filter(async e => {
                        return (e.login === doc.login)
                    })
                    if (connect.length > 0) {
                        user.lastConnection = connect[0].date
                        user.connected = connect[0].connected
                    } else {
                        user.lastConnection = 0
                        user.connected = false
                    }
                    user.visited = (visits.filter(e => {
                        return (e.userId === doc.login)
                    }).length > 0)
                    user.popularity = popularity(doc.login)
                    user.password = ''
                    user.token = ''
                    user.fingerprint = null
                    user.email = ''
                    return (user)
                }
            })
        }
        console.log(chalk.bgCyan('findAll request successfully executed in '
            + (new Date() - tic)
            + ' ms. with '
            + result.length
            + ' results'
        ))
        return result.sort((a, b) => {
            return distance(user, a) - distance(user, b)
        }).filter(e => {return (!!e)})

    } catch (err) {
        console.log(err)
    } finally {
        db.close()
    }

}

export default findAll
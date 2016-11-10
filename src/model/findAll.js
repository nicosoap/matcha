/**
 * Created by opichou on 11/3/16.
 */

import * as dbl from "../controllers/dbConnect"
import chalk from 'chalk'
import popularity from './popularity'
import match from './match'
import config from '../config.json'


//new Date(new Date('1995-12-12') - 1000*3600*24*365.25*18)


const findAll = async(login, request) => {
    if(config.debug){console.log(chalk.red('entering search model for '+ login))}
    const tic = new Date()
    let res_length = 0,
        result = [],
        db = await dbl.connect()
    try {
        let user = await db.collection('users').findOne({login, active: true})
        if (user) {
            if(config.debug){console.log(chalk.red('extrapolation of search criterions for ' + login))}
            let query = {}
            query.active = true
            if(config.debug){console.log(chalk.red('fetching database collections for ' + login))}

            let blocs = await db.collection('blocks').find({$or: [{userId: login}, {otherId: login}]}).toArray()
            console.log(blocs)
            let liked = await db.collection('likes').find({userId: login}).toArray()
            let likes_me = await db.collection('likes').find({otherId: login}).toArray()
            let connections = await db.collection('connections').find().toArray()
            let visits = await db.collection('visits').find({otherId: login}).toArray()
            if(config.debug){console.log(chalk.red('extrapolation of search criterion for ' + login))}

            if (user.gender === 'female'){
                query.attractedByFemale = true
            } else if (user.gender === 'other') {
                query.attractedByOther = true
            } else if (user.gender === 'male'){
                query.attractedByMale = true
            } else if (config.debug){ console.log(chalk.red('user gender is not provided'))}


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
            if (!user.AttractedByOther && !user.attractedByMale && !user.attractedByFemale) {
                gender.push({gender: 'female'})
                gender.push({gender: 'male'})
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
            if(config.debug){console.log(chalk.red('found ' + res_length + ' candidates'))}

            if (res_length !== 0) {
                await resultats.map( async doc => {
                    if(config.debug){console.log(chalk.red('analyzing candidate ' + doc.login))}
                    if(config.debug){console.log(chalk.red('is ' + doc.login + ' : ' + login + ' ?'))}

                    if ((doc.login !== login) && (blocs.filter(e => {
                            return ((e.userId === doc.login) || (e.otherId === doc.login))
                        }).length === 0)) {
                        let user = {...doc}
                        console.log(!!user)


                        if(config.debug){console.log(chalk.red('transforming data for ' + user.login))}
                        if(config.debug){console.log(chalk.red('is ' + user.login + ' liked ?'))}

                        user.liked = (liked.filter(e => {
                            return (e.otherId === doc.login)
                        }).length > 0)

                        if(config.debug){console.log(chalk.red('does ' + user.login + ' likes me ?'))}

                        user.likes_me = (likes_me.filter(e => {
                            return (e.userId === doc.login)
                        }).length > 0)

                        if(config.debug){console.log(chalk.red('is ' + user.login + ' connected ?'))}

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

                        if(config.debug){console.log(chalk.red('has ' + user.login + ' visited my profile ?'))}

                        user.visited = await (visits.filter(e => {
                            return (e.userId === doc.login)
                        }).length > 0)

                        if(config.debug){console.log(chalk.red('do ' + user.login + ' and I match ?'))}
                        user.matchingRate = match(user, doc, query)
                        if(config.debug){console.log(chalk.red('matching rate: ' + user.matchingRate))}

                        user.popularity = await popularity(doc.login, db)
                        if(config.debug){console.log(chalk.red(user.login + "'s popularity: " + user.popularity))}

                        console.log("user", user)

                        result.push(user)
                    }

                })
            }
        }

        console.log(chalk.black.bgBlue('findAll request successfully executed in '
            + (new Date() - tic) + ' ms. with ' + result.length + ' results out of '
            + res_length + ' candidates'
        ))
        console.log(resultats, result)

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
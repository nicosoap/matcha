import * as dbl from '../controllers/dbConnect'

const popularity = async (Id, db) => {
        try {
                console.log("popularity evaluation:")
                let users = await db.collection('users').count()
                console.log("user count " + users)
                await db.collection('likes').find({otherId: Id, like: true}).count()
                console.log("likes " + likes)
                let visits = await db.collection('visits').find({otherId: Id, visit: true}).count()
                console.log("visits " + visits)
                let match = await db.collection('chats').find({$or: [{otherId: Id}, {userId: Id}]}).count()
                console.log("match " + match)
                let likesPerUserRatio = likes / users
                console.log("likes per visit " + likesPerUserRatio)
                let matchPerLikeRatio = match / likes
                console.log("match per likes" + matchPerLikeRatio)
                let visitPerUsersRatio = visits / users
                console.log("visit per user " + visitPerUsersRatio)
                let popularity = 100 * ((3 * matchPerLikeRatio * likesPerUserRatio) + (2 * likesPerUserRatio) + visitPerUsersRatio) / (users * 6)
                console.log('popularity' + popularity)
                return popularity
        } catch(err) {
                console.log("popularity errors: ", err)
        }
}

export default  popularity
const popularity = (Id, liked, visits, users, chats) => {
    try {
        let likes = liked.filter(e => {
            return (e.otherId === Id && e.like === true)
        }).length
        let tested = []
        let visited = visits.filter(e => {
            if (e.otherId === Id && tested.indexOf(e.userId) === -1) {
                tested.push(e.userId)
                return true
            }
        }).length
        let match = chats.filter(e => {
            return (e.userId === Id || e.otherId === Id)
        }).length
        let likesPerUserRatio = likes / users
        let matchPerLikeRatio = match / likes
        let visitPerUsersRatio = visited/ users
        return 50 * ((matchPerLikeRatio) + (0.5 * likesPerUserRatio) + (0.5 * visitPerUsersRatio))
    } catch
        (err) {
        console.log("popularity errors: ", err)
    }
}

export default  popularity
/**
 * Created by opichou on 9/27/16.
 */



const distance = (userId, otherId) => {
    return ((userId.Lat - otherId.Lat) ** 2 + (userId.Lng - otherId.Lng) ** 2) ** 0.5
}

const match = (userId, otherId, query) => {
    if (!query){
        query = {tags: [], distanceMax: 5}
    } else if (!query.tags) {
        query.tags = []
    }
    if (!userId.tags) {
        userId.tags = []
    }
    if (!otherId.tags) {
        otherId.tags = []
    }
    let score = 0
    const basis_weight = 50,
        distance_weight = 100 - parseInt(basis_weight),
        max_distance = query.distanceMax

    userId.tags.map(m => {
        score = parseInt(score) + parseInt((otherId.tags.indexOf(m) !== -1) && 100) / parseInt(basis_weight * (((parseInt(userId.tags.length)
                + parseInt(query.tags.length))
                * parseInt(otherId.tags.length))** 0.5) / 10)
    })
    console.log(score)
    query.tags.map(m => {
        score = parseInt(score) + parseInt((otherId.tags.indexOf(m) !== -1) && 100) / parseInt(basis_weight * (((parseInt(userId.tags.length)
                + parseInt(query.tags.length))
                * parseInt(otherId.tags.length))** 0.5) / 10)
    })
    console.log(score)
    score = parseInt(score)
        + (parseInt(max_distance)
        / (parseInt(distance(userId, otherId)) * 111 + 1))
        * parseInt(distance_weight) / parseInt(max_distance) * 2
    return score
}

export default match
/**
 * Created by opichou on 9/27/16.
 */
import distance from './distance'

const match = (userId, otherId, query) => {
    try {
        if (!query) {
            const query = {tags: [], geocode: {distance: 5}}
        } else if (!query.tags) {
            query.tags = []
        }
        if (!userId.tags) {
            userId.tags = []
        }

        if (!otherId.tags) {
            otherId.tags = []
        }
        if (!query.geocode) {
            query.geocode = {distance: 5}
        }

        let score = 0
        const basis_weight = 50,
            distance_weight = 100 - basis_weight,
            max_distance = query.geocode.distance

        userId.tags.map(m => {
            score = parseInt(score, 10) + parseInt((otherId.tags.indexOf(m) !== -1) && 100, 10)
                / parseInt(basis_weight * (((parseInt(userId.tags.length, 10)
                    + parseInt(query.tags.length, 10), 10)
                    * parseInt(otherId.tags.length, 10)) ** 0.5) / 10, 10)
        })
        query.tags.map(m => {
            score = parseInt(score, 10) + parseInt((otherId.tags.indexOf(m) !== -1) && 100, 10) / parseInt(basis_weight * (((parseInt(userId.tags.length, 10)
                    + parseInt(query.tags.length, 10))
                    * parseInt(otherId.tags.length, 10)) ** 0.5) / 10, 10)
        })

        if (!query.geocode.Lat || !query.geocode.Lng) {
            query.geocode.Lat = userId.Lat
            query.geocode.Lng = userId.Lng
        }
        const dist = distance(query.geocode, otherId)

        score += score * max_distance /  (+dist + 1)  * distance_weight/100
        return score

    } catch (err) {
        console.log(err)
    }
}

export default match
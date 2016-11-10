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

        const match_weighting = ['distance', 'tags', 'popularity']
        const basis_weight = 50,
            distance_weight = basis_weight * 2 / match_weighting.length,
            tags_weight = distance_weight,
            popularity_weight = distance_weight,
            max_distance = query.geocode.distance || 5000
        let tagRatio = 1

        let score = basis_weight

        if (query.tags && query.tags.length !== 0) {
            tagRatio = 2
        }
        const  userTagRatio = userId.tags.length /tagRatio
        const  otherTagRatio = otherId.tags.length /tagRatio
        const  queryTagRatio = query.tags.length /tagRatio

        userId.tags.map(m => {
            if (otherId.tags.indexOf(m) !== -1) {
                score += 100 * userTagRatio * otherTagRatio * tags_weight
            }
        })
        query.tags.map(m => {
            if (query.tags.indexOf(m) !== -1) {
                score += 100 * queryTagRatio * userTagRatio * tags_weight
            }
        })

        if (!query.geocode.Lat || !query.geocode.Lng) {
            query.geocode.Lat = userId.Lat
            query.geocode.Lng = userId.Lng
        }
        const dist = distance(query.geocode, otherId)

        score += max_distance /  (+dist + 1)  * distance_weight/1000
        return score

    } catch (err) {
        console.log(err)
    }
}

export default match
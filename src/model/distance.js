import geolib from 'geolib'

const distance = (userId, otherId) => {
    return geolib.getDistance(
        {latitude: userId.Lat, longitude: userId.Lng},
        {latitude: otherId.Lat, longitude: otherId.Lng},
        null,
        {enableHighAccuracy: true
        }
    )
}

export default distance
/* eslint-disable */
import {
  geohashQueryBounds,
  geohashForLocation,
  distanceBetween,
} from 'geofire-common'
/* eslint-enable */
import { firestore } from './firebase'

export const retrievePlaces = (data, setData) => {
  firestore
    .collection('places')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const dbData = doc.data()
        setData((prev) => [...prev, dbData])
      })
    })
}

export const retrievePlacesByCategory = (category = 'cafe') => {
  firestore
    .collection('places')
    .where('types', 'array-contains', category)
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data().name)
      })
    })
}
// what do you

// Retrieve places nearby
// Currently finds everything within 50km radius and sorts by that
export const getClosestPlaces = (location = [34.0712, -118.4457]) => {
  const center = location
  const radiusInM = 50 * 1000 // Radius currently set to 50km
  const bounds = geohashQueryBounds(center, radiusInM)
  const promises = []
  bounds.forEach((b) => {
    const q = firestore
      .collection('places')
      .orderBy('geohash')
      .startAt(b[0])
      .endAt(b[1])

    promises.push(q.get())
  })

  Promise.all(promises)
    .then((snapshots) => {
      const matchingDocs = []
      snapshots.forEach((snap) => {
        snap.docs.forEach((doc) => {
          // this foreach loop never runs??
          const lat = doc.data().location._lat
          const lng = doc.data().location._long

          // We have to filter out a few false positives due to GeoHash
          // accuracy, but most will match
          const distanceInKm = distanceBetween([lat, lng], center)
          const distanceInM = distanceInKm * 1000
          if (distanceInM <= radiusInM) {
            matchingDocs.push(doc)
          }
        })
      })

      // Sorts the matching places within the specified radius by distance from location
      matchingDocs.sort((first, second) => {
        if (
          distanceBetween(
            [first.data().location._lat, first.data().location._long],
            center,
          ) <
          distanceBetween(
            [second.data().location._lat, second.data().location._long],
            center,
          )
        ) {
          return 1
        }
        if (
          distanceBetween(
            [first.data().location._lat, first.data().location._long],
            center,
          ) >
          distanceBetween(
            [second.data().location._lat, second.data().location._long],
            center,
          )
        ) {
          return -1
        }
        return 0
      })
      // TODO: implement sorting by minimum distance to user location here
      return matchingDocs
    })
    .then((matchingDocs) => {
      // What do you do once the matchind place docs are set into matchingdocs?
      console.log(matchingDocs)
    })
}

// Create Geohash for every entry in places table
export const createGeohashes = () => {
  firestore
    .collection('places')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const latitude = doc.data().location._lat
        const longitude = doc.data().location._long
        const locationArray = [latitude, longitude]
        doc.ref.update({
          geohash: geohashForLocation(locationArray),
        })
      })
    })
}

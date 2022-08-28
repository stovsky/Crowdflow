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
        const place = doc.data()
        setData((prev) => [...prev, place])
      })
    })
}

export const retrievePlacesByName = async (name) => {
  let place = {}
  await firestore
    .collection('places')
    .where('name', '==', name)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => (place = doc.data()))
    })

  return place
}

export const retrievePlacesById = async (id) => {
  let place = {}
  await firestore
    .collection('places')
    .where('id', '==', id)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => (place = doc.data()))
    })

  return place
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
export const getClosestPlaces = (
  location = [34.0712, -118.4457],
  initialData,
  setInitialData,
) => {
  setInitialData([])

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

  Promise.all(promises).then((snapshots) => {
    // const matchingDocs = []
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
          // matchingDocs.push(doc.data())
          setInitialData((prev) => [...prev, doc.data()])
        }
      })
    })
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

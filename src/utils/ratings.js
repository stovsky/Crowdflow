import firebase, { firestore } from './firebase'

// Store rating in database table
export const submitRatingToDatabase = (rating, uid, placeID) => {
  // If query looking for this returns anything, delete it

  const currentTime = firebase.firestore.Timestamp.now()

  firestore
    .collection('active-ratings')
    .where('uid', '==', uid)
    .where('place_id', '==', placeID)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.docs.length === 0) {
        firestore.collection('active-ratings').add({
          uid,
          rating,
          place_id: placeID,
          timestamp: currentTime,
        })
      } else {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            rating,
            timestamp: currentTime,
          })
        })
      }
    })
  // Whether previously existing or not, update with new rating

  // Add to permanent ratings table regardless
  firestore.collection('active').add({
    uid,
    rating,
    place_id: placeID,
    timestamp: currentTime,
  })
}

export const getPlacesRating = (placeID) => {
  const ratings = []
  firestore
    .collection('active')
    .where('place_id', '==', placeID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ratings.push(data.rating)
      })
    })

  return ratings
}

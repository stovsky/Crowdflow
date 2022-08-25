import firebase, { firestore } from './firebase'

export const checkExpired = (uid) => {
  const time = new Date()
  time.setTime(time.getTime() - 14400000)
  const firestoreTime = firebase.firestore.Timestamp.fromDate(time)

  firestore
    .collection('active-ratings')
    .where('timestamp', '<=', firestoreTime)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data()

        firestore.collection('inactive-ratings').add({
          uid,
          rating: data.rating,
          place_id: data.place_id,
          timestamp: data.timestamp,
        })

        doc.ref.delete()
      })
    })
}

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
}

export const getPlacesRating = () => {
  const ratings = []
  firestore
    .collection('active-ratings')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ratings.push(data.rating)
      })
    })

  return ratings
}

import firebase, { firestore } from './firebase'

// Store rating in database table
export const submitRatingToDatabase = (rating, uid, placeID) => {
  // If query looking for this returns anything, delete it
  firestore
    .collection('active-ratings')
    .where('uid', '==', uid)
    .where('place_id', '==', placeID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete()
      })
    })

  const currentTime = firebase.firestore.Timestamp.now()

  // Whether previously existing or not, update with new rating
  firestore.collection('active-ratings').add({
    uid,
    rating,
    place_id: placeID,
    timestamp: currentTime,
  })

  // Add to permanent ratings table regardless
  firestore.collection('active').add({
    uid,
    rating,
    place_id: placeID,
    timestamp: currentTime,
  })
}

import firebase, { firestore } from './firebase'

export const checkExpired = () => {
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
          uid: data.uid,
          rating: data.rating,
          place_id: data.place_id,
          timestamp: data.timestamp,
        })

        doc.ref.delete()
      })
    })
}

// Store rating in database table
export const submitRatingToDatabase = async (rating, uid, placeID) => {
  // If query looking for this returns anything, delete it

  const currentTime = firebase.firestore.Timestamp.now()
  let alreadyExists = true

  await firestore
    .collection('active-ratings')
    .where('uid', '==', uid)
    .where('place_id', '==', placeID)
    .get()
    .then(async (querySnapshot) => {
      if (querySnapshot.docs.length === 0) {
        alreadyExists = false
      } else {
        await querySnapshot.docs.at(0).ref.update({
          rating,
          timestamp: currentTime,
        })
      }
    })

  if (!alreadyExists) {
    await firestore.collection('active-ratings').add({
      uid,
      rating,
      place_id: placeID,
      timestamp: currentTime,
    })
  }

  const ratings = []

  await firestore
    .collection('active-ratings')
    .where('place_id', '==', placeID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ratings.push(data.rating)
      })
    })

  const average = ratings.reduce((a, b) => a + b) / ratings.length

  await firestore
    .collection('places')
    .where('id', '==', placeID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.update({
          rating: average,
        })
      })
    })
}

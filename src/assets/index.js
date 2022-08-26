import logo from 'assets/images/logo.svg'
import profile from 'assets/images/profile.png'
import markerDefault from 'assets/images/marker-default.svg'
import markerBarGreen from 'assets/images/marker-bar-green.svg'
import markerBarOrange from 'assets/images/marker-bar-orange.svg'
import markerBarRed from 'assets/images/marker-bar-red.svg'
import markerRestaurantGreen from 'assets/images/marker-restaurant-green.svg'
import markerRestaurantOrange from 'assets/images/marker-restaurant-orange.svg'
import markerRestaurantRed from 'assets/images/marker-restaurant-red.svg'
import markerLibraryGreen from 'assets/images/marker-library-green.svg'
import markerLibraryOrange from 'assets/images/marker-library-orange.svg'
import markerLibraryRed from 'assets/images/marker-library-red.svg'
import markerGymGreen from 'assets/images/marker-gym-green.svg'
import markerGymOrange from 'assets/images/marker-gym-orange.svg'
import markerGymRed from 'assets/images/marker-gym-red.svg'

export const images = {
  logo,
  profile,
  markerBarOrange,
  markerRestaurantOrange,
  markerLibraryOrange,
  markerGymOrange,
  markerDefault,
  markerBarGreen,
  markerRestaurantGreen,
  markerLibraryGreen,
  markerGymGreen,
  markerBarRed,
  markerRestaurantRed,
  markerLibraryRed,
  markerGymRed,
}

export const getIcon = (place) => {
  if (place) {
    if (place.types.includes('bar')) {
      if (place.rating >= 1 && place.rating < 2.333)
        return images.markerBarGreen
      if (place.rating >= 2.333 && place.rating < 3.666)
        return images.markerBarOrange
      return images.markerBarRed
    }
    if (place.types.includes('restaurant')) {
      if (place.rating >= 1 && place.rating < 2.333)
        return images.markerRestaurantGreen
      if (place.rating >= 2.333 && place.rating < 3.666)
        return images.markerRestaurantOrange
      return images.markerRestaurantRed
    }
    if (place.types.includes('library')) {
      if (place.rating >= 1 && place.rating < 2.333)
        return images.markerLibraryGreen
      if (place.rating >= 2.333 && place.rating < 3.666)
        return images.markerLibraryOrange
      return images.markerLibraryRed
    }
    if (place.types.includes('gym')) {
      if (place.rating >= 1 && place.rating < 2.333)
        return images.markerGymGreen
      if (place.rating >= 2.333 && place.rating < 3.666)
        return images.markerGymOrange
      return images.markerGymRed
    }
  }
  return images.markerDefault
}

export default {}

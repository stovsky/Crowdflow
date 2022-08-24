import 'firebase/firestore'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import firebase from 'firebase/app'
import { submitRatingToDatabase, getPlacesRating } from 'utils/ratings'
import {
  Autocomplete,
  TextField,
  FormGroup,
  Checkbox,
  FormControlLabel,
  FormControl,
  Container,
  Rating,
  Typography,
} from '@mui/material'
import { useRef, useCallback, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'components/Button'
import { actions } from 'slices/app.slice'
import { images } from 'theme'
import { retrievePlaces } from 'utils/places'
import styles from './dashboard.module.scss'

const libraries = ['places']
const mapContainerStyle = {
  width: '80vw',
  height: '100vh',
}
const center = {
  lat: 34.0689,
  lng: -118.4452,
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { me } = useSelector((state) => state.app)

  const [searchValue, setSearchValue] = useState('')
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([
    'restaurant',
    'bar',
    'gym',
    'library',
  ])
  const [marker, setMarker] = useState(null)
  const [rating, setRating] = useState(null)
  const [placeRatings, setPlaceRatings] = useState([])

  const db = firebase.firestore()

  useEffect(() => {
    retrievePlaces(data, setData)
  }, [])

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const mapRef = useRef()
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  useEffect(() => {
    if (searchValue !== '') {
      db.collection('places')
        .where('name', '==', searchValue)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const place = doc.data()
            mapRef.current.panTo({
              lat: place.location._lat,
              lng: place.location._long,
            })
            mapRef.current.setZoom(20)
          })
        })
    }
  }, [searchValue])

  useEffect(() => {
    if (rating) {
      submitRatingToDatabase(rating, me?.id, marker.id)
      setPlaceRatings(getPlacesRating(marker.id))
      console.log(placeRatings)
    }
  }, [rating])

  if (loadError) return 'Error loading maps.'
  if (!isLoaded) return 'Loading...'

  const getIcon = (place) => {
    if (place.types.includes('bar')) return images.markerBarOrange
    if (place.types.includes('restaurant')) return images.markerRestaurantOrange
    if (place.types.includes('library')) return images.markerLibraryOrange
    if (place.types.includes('gym')) return images.markerGymOrange
    return images.markerDefault
  }

  const handleCheckboxClick = (label) => {
    if (categories.includes(label)) {
      const idx = categories.indexOf(label)
      setCategories([
        ...categories.slice(0, idx),
        ...categories.slice(idx + 1, categories.length),
      ])
    } else {
      setCategories([...categories, label])
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={center}
          onLoad={onMapLoad}
          onClick={() => setMarker(null)}
          options={{ maxZoom: 20 }}
        >
          {data.map((place) => (
            <Marker
              visible={place.types.some((r) => categories.includes(r))}
              icon={getIcon(place)}
              animation={window.google.maps.Animation.DROP}
              key={place.location._lat}
              position={{ lat: place.location._lat, lng: place.location._long }}
              onClick={() => setMarker(place)}
            />
          ))}
          {marker ? (
            <InfoWindow
              position={{
                lat: marker.location._lat + 0.00003,
                lng: marker.location._long,
              }}
              onCloseClick={() => setMarker(null)}
            >
              <Container>
                <Typography>Rating</Typography>
                <Rating
                  value={rating}
                  onChange={(event, newRating) => setRating(newRating)}
                />
              </Container>
            </InfoWindow>
          ) : null}

          <FormControl
            style={{
              position: 'absolute',
              left: '1.5%',
              top: '8%',
              backgroundColor: 'white',
              padding: '0 10px',
              borderRadius: '3px',
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Restaurant"
                onChange={() => handleCheckboxClick('restaurant')}
                style={{ color: 'black' }}
              />
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Bar"
                onChange={() => handleCheckboxClick('bar')}
                style={{ color: 'black' }}
              />
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Gym"
                onChange={() => handleCheckboxClick('gym')}
                style={{ color: 'black' }}
              />
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Library"
                onChange={() => handleCheckboxClick('library')}
                style={{ color: 'black' }}
              />
            </FormGroup>
          </FormControl>

          <Autocomplete
            freeSolo
            id="search-bar"
            options={data.map((place) => place.name)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for a place"
                variant="outlined"
                style={{
                  backgroundColor: 'white',
                  width: '30%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  paddingBottom: 0,
                  marginTop: 0,
                  left: '35%',
                  top: '2%',
                  position: 'absolute',
                }}
              />
            )}
            value={searchValue}
            onChange={(event, newSearchValue) => setSearchValue(newSearchValue)}
          />
        </GoogleMap>
        <img src={images.logo} className={styles.logo} alt="logo" />
        <h3 className={styles.greeting}>{`Hi👋, ${me?.fullName || 'User'}`}</h3>
        <h1 className={styles.title}>React + Firebase Boilerplate</h1>
        <p className={styles.description}>
          This is
          {'\n'}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/facebook/create-react-app"
          >
            create react native app
          </a>
          {'\n'}
          based firebase pre-setup template with basic development setup. For
          the setup procedure, check the
          {'\n'}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/WataruMaeda/react-firebase-boilerplate/blob/master/README.md"
          >
            README
          </a>
          {'\n'}
          for more information.
        </p>
        <div className={styles.buttonContainer}>
          <Button
            label="Download for free"
            className={`btn-purple-fill ${styles.download}`}
            onClick={() => {
              window.location.href =
                'https://github.com/WataruMaeda/react-firebase-boilerplate'
            }}
          />
          <Button
            label="Logout"
            className={`btn-purple-outline ${styles.logout}`}
            onClick={() => dispatch(actions.logout())}
          />
        </div>
      </div>
    </div>
  )
}

Dashboard.propTypes = {}
Dashboard.defaultProps = {}

export default Dashboard

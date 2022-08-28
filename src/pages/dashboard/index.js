import 'firebase/firestore'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { firestore } from 'utils/firebase'
import { submitRatingToDatabase, checkExpired } from 'utils/ratings'
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
  Box,
} from '@mui/material'
import { useRef, useCallback, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'components/Button'
import { actions } from 'slices/app.slice'
import { images } from 'theme'
import { getClosestPlaces, retrievePlacesByName } from 'utils/places'
import { getIcon } from 'assets'
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

const options = {
  maxZoom: 20,
  streetViewControl: false,
  clickableIcons: false,
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { me } = useSelector((state) => state.app)

  const [searchValue, setSearchValue] = useState('')
  const [data, setData] = useState([])
  const [initialData, setInitialData] = useState([])
  const [categories, setCategories] = useState([
    'restaurant',
    'bar',
    'gym',
    'library',
  ])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [rating, setRating] = useState(null)

  useEffect(() => {
    firestore.collection('places').onSnapshot((querySnapshot) => {
      setData([])
      querySnapshot.forEach((doc) => {
        const place = doc.data()
        setData((prev) => [...prev, place])
      })
    })

    getClosestPlaces([center.lat, center.lng], initialData, setInitialData)
    checkExpired()
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
      retrievePlacesByName(searchValue).then((place) => {
        mapRef.current.panTo({
          lat: place.location._lat,
          lng: place.location._long,
        })
        mapRef.current.setZoom(20)
        getClosestPlaces(
          [place.location._lat, place.location._long],
          initialData,
          setInitialData,
        )
        console.log(initialData)
      })
    }
  }, [searchValue])

  useEffect(() => {
    if (rating) {
      submitRatingToDatabase(rating, me?.id, selectedMarker.id)
    }
  }, [rating])

  if (loadError) return 'Error loading maps.'
  if (!isLoaded) return 'Loading...'

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
          onClick={() => setSelectedMarker(null)}
          options={options}
        >
          {initialData.map((place) => (
            <Marker
              visible={place.types.some((r) => categories.includes(r))}
              icon={getIcon(data.find((obj) => obj.id === place.id))}
              animation={window.google.maps.Animation.DROP}
              key={place.id}
              position={{ lat: place.location._lat, lng: place.location._long }}
              onClick={() => {
                setSelectedMarker(data.find((obj) => obj.id === place.id))
              }}
            />
          ))}
          {selectedMarker ? (
            <InfoWindow
              position={{
                lat: selectedMarker.location._lat + 0.00003,
                lng: selectedMarker.location._long,
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <Container>
                <Box
                  height={300}
                  width={125}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: 125,
                      height: 125,
                      borderRadius: '50%',
                      border: '5px solid black',
                      top: '6%',
                    }}
                  />
                  <Typography
                    position="absolute"
                    top="12%"
                    fontFamily="Raleway"
                    fontStyle="bold"
                    fontSize="60px"
                  >
                    {selectedMarker.rating}
                  </Typography>
                  <Typography
                    position="absolute"
                    top="48%"
                    fontFamily="Raleway"
                    fontStyle="bold"
                    fontSize="relative"
                    margin="0"
                  >
                    {selectedMarker.name}
                  </Typography>
                  <div />
                  <Rating
                    style={{ position: 'absolute', top: '60%' }}
                    value={rating}
                    onChange={(event, newRating) => setRating(newRating)}
                  />
                </Box>
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

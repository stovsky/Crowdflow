import 'firebase/firestore'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import firebase from 'firebase/app'
import { Autocomplete, TextField } from '@mui/material'
import { useRef, useCallback, useState, useEffect } from 'react'
import { images } from 'theme'
import styles from './dashboard.module.scss'

const libraries = ['places']
const mapContainerStyle = {
  width: '100%',
  height: '100%',
}
const center = {
  lat: 34.0689,
  lng: -118.4452,
}

const Dashboard = () => {
  const [searchValue, setSearchValue] = useState('')
  const [data, setData] = useState([])
  const [marker, setMarker] = useState(null)

  const db = firebase.firestore()

  useEffect(() => {
    db.collection('places')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const dbData = doc.data()
          setData((prev) => [...prev, dbData])
        })
      })
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

  if (loadError) return 'Error loading maps.'
  if (!isLoaded) return 'Loading...'

  const getIcon = (place) => {
    if (place.types.includes('bar')) return images.markerBarOrange
    if (place.types.includes('restaurant')) return images.markerRestaurantOrange
    if (place.types.includes('library')) return images.markerLibraryOrange
    if (place.types.includes('gym')) return images.markerGymOrange
    return images.markerDefault
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={center}
          onLoad={onMapLoad}
        >
          {data.map((place) => (
            <Marker
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
                lat: marker.location._lat,
                lng: marker.location._long,
              }}
              onCloseClick={() => setMarker(null)}
            >
              <div>
                <h3>{marker.name}</h3>
                <p>RATING</p>
              </div>
            </InfoWindow>
          ) : null}

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
      </div>
    </div>
  )
}

Dashboard.propTypes = {}
Dashboard.defaultProps = {}

export default Dashboard

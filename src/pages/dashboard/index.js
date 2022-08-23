import 'firebase/firestore'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import firebase from 'firebase/app'
import { Autocomplete, TextField } from '@mui/material'
import { useRef, useCallback, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'components/Button'
import { actions } from 'slices/app.slice'
import { images } from 'theme'
import styles from './dashboard.module.scss'

const libraries = ['places']
const mapContainerStyle = {
  width: '80vw',
  height: '100vh',
}
const center = {
  lat: 41.499321,
  lng: -81.694359,
}

const Dashboard = () => {
  const [searchOptions, setSearchOptions] = useState([])
  const [searchValue, setSearchValue] = useState('')

  const db = firebase.firestore()

  useEffect(() => {
    db.collection('places')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          setSearchOptions((prev) => [...prev, data.name])
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
            const data = doc.data()
            // console.log(data.location);

            mapRef.current.panTo({
              lat: data.location._lat,
              lng: data.location._long,
            })
            mapRef.current.setZoom(20)
          })
        })
    }
  }, [searchValue])

  const dispatch = useDispatch()
  const { me } = useSelector((state) => state.app)

  if (loadError) return 'Error loading maps.'
  if (!isLoaded) return 'Loading...'

  const handleChange = (event, newSearchValue) => {
    setSearchValue(newSearchValue)
  }

  console.log(searchValue)
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={8}
          center={center}
          onLoad={onMapLoad}
        >
          <Autocomplete
            freeSolo
            id="search-bar"
            options={searchOptions}
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
            onChange={handleChange}
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

import React, { useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { useDispatch } from 'react-redux'
import RoundedButton from './RoundedButton'
import { actions } from '../../slices/app.slice'
import styles from './header.scss'

const headersData = [
  {
    label: 'test',
    href: '/test',
  },
  {
    label: 'logout',
    function: '/logout',
  },
]

export default function Header({ loggedIn }) {
  const [mobileView, setMobileView] = useState(false)
  const dispatch = useDispatch()

  // TODO (lukedalton)
  // UseEffect was taken from a guide - initially renders desktop width for a seocnd then splits
  useEffect(() => {
    // Function to keep track of window width and set Navbar styling
    const setMobileStyling = () =>
      window.innerWidth < 900 ? setMobileView(true) : setMobileView(false)

    setMobileStyling()

    window.addEventListener('resize', () => setMobileStyling())

    return () => {
      window.removeEventListener('resize', () => setMobileStyling())
    }
  }, [])

  const BusyLogo = <Typography variant="h3">Busy</Typography>

  const getMenuButtons = () =>
    headersData.map(({ label, href }) => (
      <Button
        {...{
          key: label,
          color: 'inherit',
          to: href,
          component: RouterLink,
        }}
      >
        {label}
      </Button>
    ))

  const displayDesktop = () => (
    <Toolbar>
      {BusyLogo}
      <Box sx={{ flexGrow: 1 }} />
      <div> {getMenuButtons()}</div>
    </Toolbar>
  )

  const logoutUser = async () => {
    dispatch(actions.logout())
  }

  const customDisplayMobile = () => (
    <Toolbar>
      <RoundedButton>Filters</RoundedButton>
      <Box sx={{ flexGrow: 1 }} />
      {BusyLogo}
      <Box sx={{ flexGrow: 1 }} />
      <RoundedButton onClick={logoutUser}>
        {' '}
        {/*  TODO(lukedalton) add popup to show logout loading that awaits this finishing, router will auto switch to login page */}
        Log Out
      </RoundedButton>
    </Toolbar>
  )

  if (!loggedIn) {
    return (
      <Box className={styles.box}>
        <AppBar component="nav" position="sticky">
          {BusyLogo}
        </AppBar>
      </Box>
    )
  }

  return (
    <Box className={styles.box}>
      <AppBar component="nav" position="sticky">
        {mobileView ? customDisplayMobile() : displayDesktop()}
      </AppBar>
    </Box>
  )
}

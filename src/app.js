import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { loadFontIcons } from 'components/FontIcon'
import store from 'utils/store'
import { createTheme, ThemeProvider } from '@mui/material'
import Router from './routes'

// Using colors defined by boilerplate in ./theme/
const theme = createTheme({
  palette: {
    primary: {
      main: '#333a41',
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: '#333a41',
          color: 'white',
          fontSize: 20,
        },
      },
    },
  },
})

function App() {
  useEffect(() => {
    loadFontIcons()
  }, [])

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <div data-testid="app" className="app">
          <Router />
        </div>
      </ThemeProvider>
    </Provider>
  )
}

export default App

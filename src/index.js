import React from 'react'
import ReactDOM from 'react-dom'
import App from 'app'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'theme/reset.scss'
import reportWebVitals from './reportWebVitals'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

/* TODO (LUKEDALTON)

* Fix Dashboard styling to remove old logos + make map fullscreen 
    Doing this first - can work on the styling of the map
    FINALLY DONE
* Add logout capabilities from header
*/

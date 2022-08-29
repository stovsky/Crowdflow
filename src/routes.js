import React, { Suspense, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { actions } from 'slices/app.slice'
import { path } from 'utils/const'
import Fallback from 'components/Fallback'
import Spinner from 'components/Spinner'
import Header from 'components/Header/Header'

const Auth = React.lazy(() => import('./pages/auth'))
const Dashboard = React.lazy(() => import('./pages/dashboard'))

function Router() {
  const dispatch = useDispatch()
  const { checked, loggedIn } = useSelector((state) => state.app)

  useEffect(() => {
    dispatch(actions.authenticate())
  }, [])

  return (
    <BrowserRouter>
      <Header loggedIn={loggedIn} />
      {checked ? (
        <Suspense fallback={<Fallback />}>
          {!loggedIn ? (
            <Switch>
              <Route path="/">
                <Auth />
              </Route>
              <Redirect to="/" />
            </Switch>
          ) : (
            <Switch>
              <Route path={path.dashboard}>
                <Dashboard />
              </Route>
              <Redirect to={path.dashboard} />
            </Switch>
          )}
        </Suspense>
      ) : (
        <div className="app-loader-container">
          <Spinner size="4rem" color="white" isLoading />
        </div>
      )}
    </BrowserRouter>
  )
}

export default Router

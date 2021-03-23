import React, { lazy, Suspense, useContext } from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import './App.css'

import { AuthProvider, AuthContext } from './context/AuthContext'
import { FetchProvider } from './context/FetchContext'

import AppShell from './AppShell'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FourOFour from './pages/FourOFour'
import logo from './images/logo.png'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Account = lazy(() => import('./pages/Account'))
const Settings = lazy(() => import('./pages/Settings'))
const Users = lazy(() => import('./pages/Users'))

const LoadingFallback = () => (
  <AppShell>
    <div className='p-4'>Loading...</div>
  </AppShell>
)

const UnauthenticatedRoutes = () => (
  <Switch>
    <Route path='/login'>
      <Login />
    </Route>
    <Route path='/signup'>
      <Signup />
    </Route>
    <Route exact path='/'>
      <Home />
    </Route>
    <Route path='*'>
      <FourOFour />
    </Route>
  </Switch>
)

const AuthenticatedRoute = ({ children, ...rest }) => {
  const auth = useContext(AuthContext)
  const { user } = useAuth0()
  console.log(user)
  return (
    <Route
      {...rest}
      render={() =>
        auth.isAuthenticated() ? (
          <AppShell>{children}</AppShell>
        ) : (
          <Redirect to='/' />
        )
      }
    ></Route>
  )
}

const AdminRoute = ({ children, ...rest }) => {
  const auth = useContext(AuthContext)
  return (
    <Route
      {...rest}
      render={() =>
        auth.isAuthenticated() && auth.isAdmin() ? (
          <AppShell>{children}</AppShell>
        ) : (
          <Redirect to='/' />
        )
      }
    ></Route>
  )
}

const LoadingLogo = () => {
  return (
    <div className='self-center'>
      <img className='w-32' src={logo} />
    </div>
  )
}

const AppRoutes = () => {
  const { isLoading } = useAuth0()
  if (isLoading) {
    return (
      <div className='h-screen flex justify-center'>
        <LoadingLogo />
      </div>
    )
  }

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <AuthenticatedRoute path='/dashboard'>
            <Dashboard />
          </AuthenticatedRoute>
          <AdminRoute path='/inventory'>
            <Inventory />
          </AdminRoute>
          <AuthenticatedRoute path='/account'>
            <Account />
          </AuthenticatedRoute>
          <AuthenticatedRoute path='/settings'>
            <Settings />
          </AuthenticatedRoute>
          <AuthenticatedRoute path='/users'>
            <Users />
          </AuthenticatedRoute>
          <UnauthenticatedRoutes />
        </Switch>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      redirectUri={`${window.location.origin}/dashboard`}
    >
      <Router>
        <AuthProvider>
          <FetchProvider>
            <div className='bg-gray-100'>
              <AppRoutes />
            </div>
          </FetchProvider>
        </AuthProvider>
      </Router>
    </Auth0Provider>
  )
}

export default App

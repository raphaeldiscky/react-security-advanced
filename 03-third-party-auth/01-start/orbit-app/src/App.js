import React, { lazy, Suspense } from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import './App.css'

import { FetchProvider } from './context/FetchContext'

import AppShell from './AppShell'

import Home from './pages/Home'
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
    <Route exact path='/'>
      <Home />
    </Route>
    <Route path='*'>
      <FourOFour />
    </Route>
  </Switch>
)

const AuthenticatedRoute = ({ children, ...rest }) => {
  const { user, isAuthenticated } = useAuth0()
  console.log(user)
  return (
    <Route
      {...rest}
      render={() =>
        isAuthenticated ? <AppShell>{children}</AppShell> : <Redirect to='/' />
      }
    ></Route>
  )
}

const AdminRoute = ({ children, ...rest }) => {
  const { user, isAuthenticated } = useAuth0()
  const roles = user[`${process.env.REACT_APP_JWT_NAMESPACE}/roles`]
  const isAdmin = roles[0] === 'admin' ? true : false
  return (
    <Route
      {...rest}
      render={() =>
        isAuthenticated && isAdmin ? (
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

const requestedScopes = [
  'read:dashboard',
  'read:inventory',
  'write:inventory',
  'edit:inventory',
  'delete:inventory',
  'read:users',
  'read:user',
  'edit:user'
]

function App() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      redirectUri={`${window.location.origin}/dashboard`}
      audience={process.env.REACT_APP_AUTH0_AUDIENCE}
      scope={requestedScopes.join(' ')}
    >
      <Router>
        <FetchProvider>
          <div className='bg-gray-100'>
            <AppRoutes />
          </div>
        </FetchProvider>
      </Router>
    </Auth0Provider>
  )
}

export default App

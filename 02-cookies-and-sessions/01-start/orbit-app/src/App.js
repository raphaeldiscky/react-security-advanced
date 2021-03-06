import React, { lazy, Suspense, useContext } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import './App.css'
import logo from './images/logo.png'

import { AuthProvider, AuthContext } from './context/AuthContext'
import { FetchProvider } from './context/FetchContext'

import AppShell from './AppShell'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FourOFour from './pages/FourOFour'

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
  const { authState } = useContext(AuthContext)
  return (
    <Route
      {...rest}
      render={() =>
        authState.isAuthenticated ? (
          <AppShell>{children}</AppShell>
        ) : (
          <Redirect to='/' />
        )
      }
    ></Route>
  )
}

const AdminRoute = ({ children, ...rest }) => {
  const { authState } = useContext(AuthContext)
  return (
    <Route
      {...rest}
      render={() =>
        authState.isAuthenticated && authState.userInfo.role === 'admin' ? (
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
      <img className='w-32' src={logo} alt='logo' />
    </div>
  )
}

const AppRoutes = () => {
  const { authState } = useContext(AuthContext)
  if (!authState.userInfo) {
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
    <Router>
      <FetchProvider>
        <AuthProvider>
          <div className='bg-gray-100'>
            <AppRoutes />
          </div>
        </AuthProvider>
      </FetchProvider>
    </Router>
  )
}

export default App

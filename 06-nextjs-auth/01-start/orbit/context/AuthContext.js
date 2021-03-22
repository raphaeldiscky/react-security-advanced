import React, { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { publicFetch, privateFetch } from '../util/fetch'

const AuthContext = createContext()
const { Provider } = AuthContext

const AuthProvider = ({ children }) => {
  const router = useRouter()

  const [authState, setAuthState] = useState({
    userInfo: { firtsName: 'Ryan', role: 'admin' }
  })

  const setAuthInfo = ({ userInfo, expiresAt }) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo))
    window.localStorage.setItem('expiresAt', expiresAt)

    setAuthState({
      userInfo,
      expiresAt
    })
  }

  const logout = async () => {
    try {
      await publicFetch.delete('logout')
      window.localStorage.removeItem('userInfo')
      window.localStorage.removeItem('expiresAt')
      setAuthState({ userInfo: null })
      router.push('/login')
    } catch (err) {
      return err
    }
  }

  const isAuthenticated = () => {
    // if (!authState.expiresAt) {
    //   return false;
    // }
    // return (
    //   new Date().getTime() / 1000 < authState.expiresAt
    // );
    return true
  }

  const isAdmin = () => {
    return authState.userInfo.role === 'admin'
  }

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authInfo) => setAuthInfo(authInfo),
        logout,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </Provider>
  )
}

export { AuthContext, AuthProvider }

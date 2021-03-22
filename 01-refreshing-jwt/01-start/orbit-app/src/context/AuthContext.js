import React, { createContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { publicFetch } from './../util/fetch'

const AuthContext = createContext()
const { Provider } = AuthContext

const AuthProvider = ({ children }) => {
  const history = useHistory()

  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  const expiresAt = localStorage.getItem('expiresAt')

  const [authState, setAuthState] = useState({
    token,
    expiresAt,
    userInfo: userInfo ? JSON.parse(userInfo) : {}
  })

  const setAuthInfo = ({ token, userInfo, expiresAt }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('expiresAt', expiresAt)

    setAuthState({
      token,
      userInfo,
      expiresAt
    })
  }

  const logout = async () => {
    try {
      await publicFetch.delete('/token/invalidate')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('expiresAt')
      setAuthState({})
      history.push('/login')
    } catch (err) {
      console.log(err)
    }
  }

  const isAuthenticated = () => {
    if (!authState.token || !authState.expiresAt) {
      return false
    }
    return new Date().getTime() / 1000 < authState.expiresAt
  }

  const isAdmin = () => {
    return authState.userInfo.role === 'admin'
  }

  const getNewToken = async () => {
    try {
      const { data } = await publicFetch.get('/token/refresh')
      setAuthState(Object.assign({}, authState, { token: data.token }))
    } catch (err) {
      return err
    }
  }

  const getAccessToken = () => {
    return localStorage.getItem('token')
  }

  const getNewTokenForRequest = async (failedRequest) => {
    const { data } = await publicFetch.get('/token/refresh')
    failedRequest.response.config.headers[
      'Authorization'
    ] = `Bearer ${data.token}`
    localStorage.setItem('token', data.token)
    return Promise.resolve()
  }

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authInfo) => setAuthInfo(authInfo),
        logout,
        isAuthenticated,
        isAdmin,
        getNewToken,
        getAccessToken,
        getNewTokenForRequest
      }}
    >
      {children}
    </Provider>
  )
}

export { AuthContext, AuthProvider }

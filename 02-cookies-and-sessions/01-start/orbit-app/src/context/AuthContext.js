import React, { createContext, useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { FetchContext } from './FetchContext'

const AuthContext = createContext()
const { Provider } = AuthContext

const AuthProvider = ({ children }) => {
  const history = useHistory()
  const fetchContext = useContext(FetchContext)

  const [authState, setAuthState] = useState({
    userInfo: null,
    isAuthenticated: false
  })

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data } = await fetchContext.authAxios.get('/user-info')
        setAuthState({
          userInfo: data.user,
          isAuthenticated: true
        })
      } catch (err) {
        setAuthState({
          userInfo: null,
          isAuthenticated: false
        })
      }
    }
    getUserInfo()
  }, [fetchContext])

  const setAuthInfo = ({ userInfo }) => {
    setAuthState({
      userInfo
    })
  }

  const logout = async () => {
    try {
      await fetchContext.authAxios.post('/logout')
      setAuthState({
        userInfo: null,
        isAuthenticated: false
      })
      history.push('/login')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authInfo) => setAuthInfo(authInfo),
        logout
      }}
    >
      {children}
    </Provider>
  )
}

export { AuthContext, AuthProvider }

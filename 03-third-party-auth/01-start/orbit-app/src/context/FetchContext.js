import React, { createContext, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const FetchContext = createContext()
const { Provider } = FetchContext

const FetchProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState()
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await getAccessTokenSilently()
        console.log(token)
        setAccessToken(token)
      } catch (err) {
        console.log(err)
      }
    }
    getAccessToken()
  }, [getAccessTokenSilently])

  const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL
  })

  authAxios.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${accessToken}`
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  authAxios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      const code = error && error.response ? error.response.status : 0
      if (code === 401 || code === 403) {
        console.log('error code', code)
      }
      return Promise.reject(error)
    }
  )

  return (
    <Provider
      value={{
        authAxios
      }}
    >
      {children}
    </Provider>
  )
}

export { FetchContext, FetchProvider }

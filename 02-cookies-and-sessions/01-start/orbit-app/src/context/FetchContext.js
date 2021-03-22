import React, { createContext } from 'react'
import axios from 'axios'

const FetchContext = createContext()
const { Provider } = FetchContext

const FetchProvider = ({ children }) => {
  const publicAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL
  })

  const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL
  })

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
        authAxios,
        publicAxios
      }}
    >
      {children}
    </Provider>
  )
}

export { FetchContext, FetchProvider }

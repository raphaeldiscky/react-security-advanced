import React, { createContext, useEffect } from 'react'
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

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const { data } = await publicAxios.get('/csrf-token')
        publicAxios.defaults.headers['X-CSRF-Token'] = data.csrfToken
        authAxios.defaults.headers['X-CSRF-Token'] = data.csrfToken
        console.log(data)
      } catch (err) {
        console.log(err)
      }
    }
    getCsrfToken()
  }, [])

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

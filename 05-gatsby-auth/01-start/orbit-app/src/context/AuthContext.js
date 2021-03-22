import React, { createContext, useState, useEffect } from 'react';
import { navigate } from 'gatsby';

const AuthContext = createContext();
const { Provider } = AuthContext;

const isBrowser = () => typeof window !== 'undefined';

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState();

  useEffect(() => {
    if (isBrowser()) {
      const token = window.localStorage.getItem('token');
      const userInfo = window.localStorage.getItem('userInfo');
      const expiresAt = window.localStorage.getItem('expiresAt');

      setAuthState({
        token,
        expiresAt,
        userInfo: userInfo ? JSON.parse(userInfo) : {}
      });
    }
  }, []);

  const setAuthInfo = ({ token, userInfo, expiresAt }) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
    window.localStorage.setItem('expiresAt', expiresAt);

    setAuthState({
      token,
      userInfo,
      expiresAt
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('expiresAt');
    navigate('/login');
    setAuthState({});
  };

  const isAuthenticated = () => {
    if (!authState) {
      return false;
    }
    if (!authState.token || !authState.expiresAt) {
      return false;
    }
    return new Date().getTime() / 1000 < authState.expiresAt;
  };

  const isAdmin = () => {
    return authState.userInfo.role === 'admin';
  };

  return (
    <Provider
      value={{
        authState,
        setAuthState: authInfo => setAuthInfo(authInfo),
        logout,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </Provider>
  );
};

export { AuthContext, AuthProvider };

import React, {
  createContext,
  useState,
  useEffect
} from 'react';
import { useRouter } from 'next/router';
import { publicFetch, privateFetch } from '../util/fetch';

const AuthContext = createContext();
const { Provider } = AuthContext;

const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [authState, setAuthState] = useState();

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data } = await privateFetch().get('user');
        setAuthState({ userInfo: data });
      } catch (err) {
        setAuthState({ userInfo: null });
        console.log(err);
      }
    };
    getUserInfo();
  }, []);

  const setAuthInfo = ({ userInfo, expiresAt }) => {
    window.localStorage.setItem(
      'userInfo',
      JSON.stringify(userInfo)
    );
    window.localStorage.setItem('expiresAt', expiresAt);

    setAuthState({
      userInfo,
      expiresAt
    });
  };

  const logout = async () => {
    try {
      await publicFetch.delete('logout');
      window.localStorage.removeItem('userInfo');
      window.localStorage.removeItem('expiresAt');
      setAuthState({ userInfo: null });
      router.push('/login');
    } catch (err) {
      return err;
    }
  };

  const isAuthenticated = () => {
    if (!authState.expiresAt) {
      return false;
    }
    return (
      new Date().getTime() / 1000 < authState.expiresAt
    );
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

import React, { useContext } from 'react';
import { Router } from '@reach/router';
import { navigate } from 'gatsby';
import Login from '../components/login';
import Profile from '../components/profile';
import Signup from '../components/signup';
import { AuthContext, AuthProvider } from './../context/AuthContext';
import { FetchProvider } from './../context/FetchContext';

const publicRoutes = ['/app/login', '/app/signup'];

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  const auth = useContext(AuthContext);
  if (!auth.isAuthenticated() && !publicRoutes.includes(location.pathname)) {
    navigate('/app/login');
    return null;
  }
  return <Component {...rest} />;
};

const AppRoutes = () => {
  const auth = useContext(AuthContext);
  return (
    <Router>
      {auth.authState && (
        <>
          <PrivateRoute path="/app/profile" component={Profile} />
          <Login path="/app/login" />
          <Signup path="/app/signup" />
        </>
      )}
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <FetchProvider>
        <AppRoutes />
      </FetchProvider>
    </AuthProvider>
  );
};

export default App;

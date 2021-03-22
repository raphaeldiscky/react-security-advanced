import Head from 'next/head';
import { useRouter } from 'next/router';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '../styles/index.css';
import {
  AuthProvider,
  AuthContext
} from './../context/AuthContext';
import { FetchProvider } from './../context/FetchContext';
import AppShell from './AppShell';
import { useContext } from 'react';

config.autoAddCss = false;

const appShellRoutes = [
  '/dashboard',
  '/inventory',
  '/account',
  '/settings',
  '/users'
];

const AppRoutes = ({ component: Component, pageProps }) => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  if (!auth.authState) {
    return <p>Loading...</p>;
  }
  return (
    <>
      {appShellRoutes.includes(router.pathname) ? (
        <AppShell>
          <Component {...pageProps} />
        </AppShell>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
};

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <FetchProvider>
        <Head>
          <title>Orbit</title>
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <AppRoutes
          component={Component}
          pageProps={pageProps}
        />
      </FetchProvider>
    </AuthProvider>
  );
}

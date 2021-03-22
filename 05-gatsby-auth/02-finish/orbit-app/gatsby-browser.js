/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import './src/css/index.css';
import React from 'react';

import { AuthProvider } from './src/context/AuthContext';
import { FetchProvider } from './src/context/FetchContext';

export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    <FetchProvider>{element}</FetchProvider>
  </AuthProvider>
);

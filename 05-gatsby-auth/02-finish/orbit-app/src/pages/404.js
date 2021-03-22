import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';

import GradientLink from '../components/common/GradientLink';

const NotFoundPage = () => {
  return (
    <Layout>
      <SEO title="404: Not found" />
      <div className="flex flex-col items-center h-screen">
        <h1 className="text-6xl font-bold text-gray-800 mt-10">404</h1>
        <h2 className="text-4xl">Page Not Found</h2>
        <div className="mt-2">
          <GradientLink text="Go Back Home" to="/" />
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;

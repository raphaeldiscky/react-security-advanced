import React from 'react';
import GradientBar from '../components/common/GradientBar';
import GradientLink from '../components/common/GradientLink';
import Layout from '../components/layout';
import SEO from '../components/seo';

const Home = () => {
  return (
    <Layout>
      <SEO title="Home" />
      <GradientBar />
      <div className="h-full bg-blue-900">
        <div className="opacity-10">
          <img
            className="object-fill w-full"
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9"
            alt="Home"
          />
        </div>
        <div className="absolute left-0 top-0 mt-32 lg:mt-48 px-12 nato-sans">
          <div className="w-full lg:w-2/3">
            <h1 className="text-gray-200 text-2xl lg:text-6xl sm:text-5xl font-bold leading-tight">
              Sales Data Management That Works For Your Team
            </h1>
            <h2 className="text-gray-400 text-md sm:text-2xl sm:mt-10 mt-4">
              Take the pain out of managing your sales data
            </h2>
            <div className="mt-4 sm:mt-10 w-48">
              <GradientLink text="Get Started" size="lg" to="signup" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

import React, { useContext } from 'react';
import { Link } from 'gatsby';
import GradientLink from '../components/common/GradientLink';
import { AuthContext } from './../context/AuthContext';
import logo from './../images/logo.png';
import AvatarDropdown from './AvatarDropdown';

const Navbar = () => {
  const auth = useContext(AuthContext);
  return (
    <nav className="w-full top-0 bg-white px-10 py-5">
      <div className="flex justify-between">
        <Link to="/">
          <img className="w-32 h-full" src={logo} alt="Logo" />
        </Link>
        <div className="flex items-center z-10">
          {auth && auth.isAuthenticated() ? (
            <AvatarDropdown />
          ) : (
            <>
              <Link to="/app/signup" className="text-blue-700 mr-6">
                Sign Up
              </Link>
              <GradientLink to="/app/login" text="Log In" />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

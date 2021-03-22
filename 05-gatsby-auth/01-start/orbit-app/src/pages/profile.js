import React, { useContext, useEffect, useState } from 'react';
import classnames from 'classnames';
import { FetchContext } from '../context/FetchContext';
import defaultAvatar from './../images/defaultAvatar.png';
import Card from '../components/common/Card';
import GradientBar from '../components/common/GradientBar';
import Layout from '../components/layout';
import SEO from '../components/seo';

const RoleTag = ({ role }) => {
  const className = classnames({
    'uppercase px-2 py-1 rounded text-sm': true,
    'bg-green-300 text-green-800': role === 'admin',
    'bg-yellow-300 text-yellow-800': role === 'user'
  });

  return <span className={className}>{role}</span>;
};

const ProfileBody = ({ profile }) => {
  return (
    <section className="flex">
      <div className="m-4 w-1/4 sm:w-auto">
        <img
          className="w-32 rounded-full"
          src={profile.avatar || defaultAvatar}
          alt="profile"
        />
      </div>
      <div className="mt-4 w-3/4 sm:w-auto">
        <div className="flex">
          <p className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </p>
          <div className="ml-2 self-center">
            <RoleTag role={profile.role} />
          </div>
        </div>
        <section className="py-4">
          <div className="mt-2">
            <p className="text-xs text-gray-600 uppercase">Email</p>
            <p>{profile.email}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-600 uppercase">User Bio</p>
            <p>{profile.bio}</p>
          </div>
        </section>
      </div>
    </section>
  );
};
const ProfileCard = ({ profile }) => {
  return (
    <Card>
      <ProfileBody profile={profile} />
    </Card>
  );
};

const Profile = () => {
  const fetchContext = useContext(FetchContext);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setProfileLoading(true);
        const { data } = await fetchContext.authAxios.get('profile');
        setProfile(data.profile);
        setProfileLoading(false);
      } catch (err) {
        console.log(err);
        setProfileLoading(false);
      }
    };
    getProfile();
  }, [fetchContext, setProfile]);

  return (
    <Layout>
      <SEO title="Profile" />
      <GradientBar />
      <section className="p-10 h-screen bg-gray-100">
        {profileLoading ? (
          <p>Loading...</p>
        ) : profile ? (
          <ProfileCard profile={profile} />
        ) : (
          <p>No profile</p>
        )}
      </section>
    </Layout>
  );
};

export default Profile;

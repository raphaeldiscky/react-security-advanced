import React, { useContext, useEffect, useState } from 'react'
import PageTitle from '../components/common/PageTitle'
import { FetchContext } from '../context/FetchContext'
import Card from '../components/common/Card'
import { privateFetch } from './../util/fetch'

const UserDetailLabel = ({ text }) => (
  <p className='mt-2 uppercase font-bold text-gray-500 text-xs'>{text}</p>
)
const UserDetail = ({ user }) => (
  <Card>
    <div className='flex'>
      <div className='w-24'>
        <img src={user.avatar || '/defaultAvatar.png'} alt='avatar' />
      </div>

      <div>
        <p className='font-bold text-lg'>
          {user.firstName} {user.lastName}
        </p>

        <div className='mt-2'>
          <UserDetailLabel text='Bio' />
          {user.bio ? (
            <div dangerouslySetInnerHTML={{ __html: user.bio }} />
          ) : (
            <p className='text-gray-500 italic'>No bio set</p>
          )}
        </div>
      </div>
    </div>
  </Card>
)

const Users = ({ data }) => {
  const fetchContext = useContext(FetchContext)
  const [users, setUsers] = useState(data)

  // useEffect(() => {
  //   const getUsers = async () => {
  //     try {
  //       const { data } = await fetchContext.authAxios.get(
  //         'users'
  //       );
  //       setUsers(data.users);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getUsers();
  // }, [fetchContext.authAxios]);

  return (
    <>
      <PageTitle title='Users' />
      <div className='flex flex-col'>
        {!!users.length &&
          users.map((user) => (
            <div className='m-2' key={user._id}>
              <UserDetail user={user} />
            </div>
          ))}
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  try {
    const { data } = await privateFetch.get('users')
    console.log('the users', data)
    return { props: { data } }
  } catch (err) {
    return { props: { data: {} } }
  }
}

export default Users

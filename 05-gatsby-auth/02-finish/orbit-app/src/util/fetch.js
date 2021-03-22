import axios from 'axios';

const publicFetch = axios.create({
  baseURL: process.env.GATSBY_API_URL
});

export { publicFetch };

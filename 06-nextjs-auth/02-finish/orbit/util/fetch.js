import axios from 'axios';

const publicFetch = axios.create({
  baseURL: process.env.NEXT_API_URL
});

// const privateFetch = axios.create({
//   baseURL: process.env.NEXT_API_URL
// });

const privateFetch = context =>
  axios.create({
    baseURL: process.env.NEXT_API_URL,
    headers:
      context &&
      context.req &&
      context.req.headers &&
      context.req.headers.cookie
        ? { cookie: context.req.headers.cookie }
        : undefined
  });

export { publicFetch, privateFetch };

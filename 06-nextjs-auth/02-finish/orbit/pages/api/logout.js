import nextConnect from 'next-connect';
import { removeTokenCookie } from './util';
import { serialize, parse } from 'cookie';

const handler = nextConnect();

handler.delete(async (req, res) => {
  try {
    const cookie = serialize('token', '', {
      maxAge: -1,
      path: '/'
    });

    res.setHeader('Set-Cookie', cookie);
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ message: 'Something went wrong.' });
  }
});

export default handler;

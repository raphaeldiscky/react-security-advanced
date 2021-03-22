import * as data from './data/dashboard';
import nextConnect from 'next-connect';
import authorize from './middleware/authorize';

const handler = nextConnect();

handler.use(authorize);

handler.get(async (req, res) => {
  try {
    res.json(data);
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Something went wrong' });
  }
});

export default handler;

import nextConnect from 'next-connect';
import database from './middleware/database';
import authorizeAdmin from './middleware/authorize-admin';

const handler = nextConnect();

handler.use(database);
handler.use(authorizeAdmin);

handler.get(async (req, res) => {
  try {
    const data = await req.db
      .collection('users')
      .find({})
      .toArray();

    res.json(data);
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Something went wrong' });
  }
});

export default handler;

import nextConnect from 'next-connect';
import database from './middleware/database';
import authorize from './middleware/authorize';
import { ObjectId } from 'mongodb';

const handler = nextConnect();
handler.use(database);
handler.use(authorize);

handler.get(async (req, res) => {
  try {
    const data = await req.db
      .collection('users')
      .findOne({ _id: ObjectId(req.user.sub) });

    const {
      _id,
      firstName,
      lastName,
      email,
      role,
      exp
    } = data;

    res.json({
      _id,
      firstName,
      lastName,
      email,
      role,
      exp
    });
  } catch (err) {
    res.status(401).json({ message: 'Not authorized' });
  }
});

export default handler;

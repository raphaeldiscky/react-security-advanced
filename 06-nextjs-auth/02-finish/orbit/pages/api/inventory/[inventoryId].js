import nextConnect from 'next-connect';
import database from './../middleware/database';
import { ObjectId } from 'mongodb';
import authorizeAdmin from './../middleware/authorize-admin';

const handler = nextConnect();

handler.use(database);
handler.use(authorizeAdmin);

handler.delete(async (req, res) => {
  try {
    const { sub } = req.user;
    const { inventoryId } = req.query;

    await req.db.collection('inventory-items').deleteOne({
      _id: ObjectId(inventoryId),
      user: ObjectId(sub)
    });

    res.status(201).json({
      message: 'Inventory item deleted!',
      deletedItem: { _id: inventoryId }
    });
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem creating the item'
    });
  }
});

export default handler;

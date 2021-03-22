import nextConnect from 'next-connect'
import database from './../middleware/database'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler.use(database)

handler.get(async (req, res) => {
  try {
    const { sub } = req.user
    const data = await req.db
      .collection('inventory-items')
      .find({ user: ObjectId(sub) })
      .toArray()
    res.json(data)
  } catch (err) {
    console.log('the err', err)
    res.status(400).json({ message: 'Something went wrong' })
  }
})

handler.post(async (req, res) => {
  try {
    const { sub } = req.user
    const input = Object.assign({}, req.body, {
      user: ObjectId(sub),
      image:
        'https://images.unsplash.com/photo-1580169980114-ccd0babfa840?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=600&fit=crop&ixid=eyJhcHBfaWQiOjF9'
    })

    const inventoryItem = await req.db
      .collection('inventory-items')
      .insertOne(input)

    const insertedInventoryItem = await req.db
      .collection('inventory-items')
      .findOne({ _id: ObjectId(inventoryItem.insertedId) })

    res.status(201).json({
      message: 'Inventory item created!',
      inventoryItem: insertedInventoryItem
    })
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem creating the item'
    })
  }
})

export default handler

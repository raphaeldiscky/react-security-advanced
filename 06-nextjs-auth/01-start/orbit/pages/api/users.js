import nextConnect from 'next-connect'
import database from './middleware/database'

const handler = nextConnect()

handler.use(database)

handler.get(async (req, res) => {
  try {
    const data = await req.db.collection('users').find({}).toArray()

    res.json(data)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
})

export default handler

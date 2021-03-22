import nextConnect from 'next-connect'
import database from './middleware/database'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler.use(database)

handler.get(async (req, res) => {
  try {
    const { sub } = req.user
    const data = await req.db
      .collection('users')
      .findOne({ _id: ObjectId(sub) })

    const { bio } = data

    res.json({ bio })
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
})

handler.patch(async (req, res) => {
  try {
    const { sub } = req.user
    const data = await req.db
      .collection('users')
      .updateOne({ _id: ObjectId(sub) }, { $set: { bio: req.body.bio } })

    const { bio } = data

    res.json({
      message: 'Bio updated!',
      bio
    })
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
})

export default handler

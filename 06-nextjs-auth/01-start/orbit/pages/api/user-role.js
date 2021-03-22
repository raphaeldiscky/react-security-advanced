import nextConnect from 'next-connect'
import database from './middleware/database'
import { ObjectId } from 'mongodb'

const handler = nextConnect()

handler.use(database)

handler.patch(async (req, res) => {
  try {
    const { sub } = req.user
    const { role } = req.body
    const allowedRoles = ['user', 'admin']

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role not allowed' })
    }
    await req.db
      .collection('users')
      .updateOne({ _id: ObjectId(sub) }, { $set: { role } })

    res.json({
      message:
        'User role updated. You must log in again for the changes to take effect.'
    })
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
})

export default handler

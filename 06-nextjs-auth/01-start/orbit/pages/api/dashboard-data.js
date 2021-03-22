import * as data from './data/dashboard'
import nextConnect from 'next-connect'

const handler = nextConnect()

handler.get(async (req, res) => {
  try {
    res.json(data)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
})

export default handler

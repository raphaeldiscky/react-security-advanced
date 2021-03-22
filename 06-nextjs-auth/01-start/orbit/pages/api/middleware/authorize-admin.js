import nextConnect from 'next-connect'

async function authorizeAdmin(req, res, next) {
  try {
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' })
  }
}

const middleware = nextConnect()

middleware.use(authorizeAdmin)

export default middleware

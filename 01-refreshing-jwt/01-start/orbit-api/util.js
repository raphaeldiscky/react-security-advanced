const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const randToken = require('rand-token')

const createToken = (user) => {
  // Sign the JWT
  if (!user.role) {
    throw new Error('No user role specified')
  }
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role,
      iss: 'api.orbit',
      aud: 'api.orbit'
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '5s' }
  )
}

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    // Generate a salt at level 12 strength
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err)
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err)
        }
        resolve(hash)
      })
    })
  })
}

const verifyPassword = (passwordAttempt, hashedPassword) => {
  return bcrypt.compare(passwordAttempt, hashedPassword)
}

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'There was a problem authorizing the request'
    })
  }
  if (req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Insufficient role' })
  }
  next()
}

const getRefreshToken = () => {
  return randToken.uid(64)
}

const oneWeek = 7 * 24 * 3600 * 1000

const getDatePlusOneWeek = () => {
  return new Date(new Date().valueOf() + oneWeek)
}

module.exports = {
  createToken,
  hashPassword,
  verifyPassword,
  requireAdmin,
  getRefreshToken,
  oneWeek,
  getDatePlusOneWeek
}

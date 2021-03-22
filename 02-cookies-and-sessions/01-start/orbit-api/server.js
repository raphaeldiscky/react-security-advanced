require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('express-jwt')
const jwtDecode = require('jwt-decode')
const mongoose = require('mongoose')
const session = require('express-session')

const dashboardData = require('./data/dashboard')
const User = require('./data/User')
const InventoryItem = require('./data/InventoryItem')

const { createToken, hashPassword, verifyPassword } = require('./util')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true, // set cookie in browser before we get info from session
    resave: false,
    cookie: {
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE)
    }
  })
)

app.use((req, res, next) => {
  console.log(req.session)
  next()
})

app.post('/api/authenticate', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      email
    }).lean()

    if (!user) {
      return res.status(403).json({
        message: 'Wrong email or password.'
      })
    }

    const passwordValid = await verifyPassword(password, user.password)

    if (passwordValid) {
      const { password, bio, ...rest } = user
      const userInfo = Object.assign({}, { ...rest })

      const token = createToken(userInfo)

      const decodedToken = jwtDecode(token)
      const expiresAt = decodedToken.exp

      req.session.user = userInfo

      res.json({
        message: 'Authentication successful!',
        token,
        userInfo,
        expiresAt
      })
    } else {
      res.status(403).json({
        message: 'Wrong email or password.'
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: 'Something went wrong.' })
  }
})

app.post('/api/signup', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body

    const hashedPassword = await hashPassword(req.body.password)

    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: hashedPassword,
      role: 'admin'
    }

    const existingEmail = await User.findOne({
      email: userData.email
    }).lean()

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const newUser = new User(userData)
    const savedUser = await newUser.save()

    if (savedUser) {
      const token = createToken(savedUser)
      const decodedToken = jwtDecode(token)
      const expiresAt = decodedToken.exp

      const { firstName, lastName, email, role } = savedUser

      const userInfo = {
        firstName,
        lastName,
        email,
        role
      }

      req.session.user = userInfo

      return res.json({
        message: 'User created!',
        token,
        userInfo,
        expiresAt
      })
    } else {
      return res.status(400).json({
        message: 'There was a problem creating your account'
      })
    }
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem creating your account'
    })
  }
})

const requireAuth = (req, res, next) => {
  const { user } = req.session
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

const requireAdmin = (req, res, next) => {
  const { user } = req.session
  if (user.role !== 'admin') {
    return res.status(401).json({ message: 'Insufficient role' })
  }
  next()
}

app.get('/api/dashboard-data', requireAuth, (req, res) =>
  res.json(dashboardData)
)

app.patch('/api/user-role', async (req, res) => {
  try {
    const { role } = req.body
    const allowedRoles = ['user', 'admin']

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role not allowed' })
    }
    await User.findOneAndUpdate({ _id: req.user.sub }, { role })
    res.json({
      message:
        'User role updated. You must log in again for the changes to take effect.'
    })
  } catch (err) {
    return res.status(400).json({ error: err })
  }
})

app.get('/api/inventory', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { user } = req.session
    const inventoryItems = await InventoryItem.find({
      user: user._id
    })
    res.json(inventoryItems)
  } catch (err) {
    return res.status(400).json({ error: err })
  }
})

app.post('/api/inventory', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { user } = req.session
    const input = Object.assign({}, req.body, {
      user: user._id
    })
    const inventoryItem = new InventoryItem(input)
    await inventoryItem.save()
    res.status(201).json({
      message: 'Inventory item created!',
      inventoryItem
    })
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem creating the item'
    })
  }
})

app.delete(
  '/api/inventory/:id',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { user } = req.session
      const deletedItem = await InventoryItem.findOneAndDelete({
        _id: req.params.id,
        user: user._id
      })
      res.status(201).json({
        message: 'Inventory item deleted!',
        deletedItem
      })
    } catch (err) {
      return res.status(400).json({
        message: 'There was a problem deleting the item.'
      })
    }
  }
)

app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await User.find()
      .lean()
      .select('_id firstName lastName avatar bio')

    res.json({
      users
    })
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem getting the users'
    })
  }
})

app.get('/api/bio', requireAuth, async (req, res) => {
  try {
    const { user } = req.session
    const foundUser = await User.findOne({
      _id: user._id
    })
      .lean()
      .select('bio')

    res.json({
      bio: foundUser.bio
    })
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem updating your bio'
    })
  }
})

app.patch('/api/bio', requireAuth, async (req, res) => {
  try {
    const { user } = req.session
    const { bio } = req.body
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id
      },
      {
        bio
      },
      {
        new: true
      }
    )

    res.json({
      message: 'Bio updated!',
      bio: updatedUser.bio
    })
  } catch (err) {
    return res.status(400).json({
      message: 'There was a problem updating your bio'
    })
  }
})

async function connect() {
  try {
    mongoose.Promise = global.Promise
    await mongoose.connect(process.env.ATLAS_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
  } catch (err) {
    console.log('Mongoose error', err)
  }
  app.listen(3001)
  console.log('API listening on localhost:3001')
}

connect()

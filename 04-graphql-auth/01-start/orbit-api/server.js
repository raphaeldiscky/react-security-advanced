require('dotenv').config()
const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')
const mongoose = require('mongoose')
const dashboardData = require('./data/dashboard')
const User = require('./data/User')
const InventoryItem = require('./data/InventoryItem')

const {
  ApolloServer,
  gql,
  ApolloError,
  UserInputError,
  AuthenticationError
} = require('apollo-server')

const { createToken, hashPassword, verifyPassword } = require('./util')

// resolver = endpoint for graphql query
const resolvers = {
  Query: {
    dashboardData: (parent, args, context) => {
      const { user } = context
      if (!user || (user.role !== 'user' && user.role !== 'admin')) {
        throw new AuthenticationError('Not authorized')
      }
      return dashboardData
    },
    users: async () => {
      try {
        return await User.find()
          .lean()
          .select('_id firstName lastName avatar bio')
      } catch (err) {
        return err
      }
    },
    user: async () => {
      try {
        const user = '507f1f77bcf86cd799439011'
        return await User.findOne({ _id: user })
          .lean()
          .select('_id firstName lastName role avatar bio')
      } catch (err) {
        return err
      }
    },
    inventoryItems: async () => {
      try {
        const user = '507f1f77bcf86cd799439011'
        return await InventoryItem.find({
          user: user
        })
      } catch (err) {
        return err
      }
    },
    userBio: async () => {
      try {
        const user = '507f1f77bcf86cd799439011'
        const foundUser = await User.findOne({
          _id: user
        })
          .lean()
          .select('bio')

        return { bio: foundUser.bio }
      } catch (err) {
        return err
      }
    }
  },
  Mutation: {
    login: async (parent, args) => {
      try {
        const { email, password } = args

        const user = await User.findOne({
          email
        }).lean()

        if (!user) {
          throw new UserInputError('Wrong email or password')
        }

        const passwordValid = await verifyPassword(password, user.password)

        if (passwordValid) {
          const { password, bio, ...rest } = user
          const userInfo = Object.assign({}, { ...rest })

          const token = createToken(userInfo)

          const decodedToken = jwtDecode(token)
          const expiresAt = decodedToken.exp

          return {
            message: 'Authentication successful!',
            token,
            userInfo,
            expiresAt
          }
        } else {
          throw new UserInputError('Wrong email or password')
        }
      } catch (err) {
        return err
      }
    },
    signup: async (parent, args) => {
      try {
        const { firstName, lastName, email, password } = args

        const hashedPassword = await hashPassword(password)

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
          throw new ApolloError('Email already exists')
        }

        const newUser = new User(userData)
        const savedUser = await newUser.save()

        if (savedUser) {
          const token = createToken(savedUser)
          const decodedToken = jwtDecode(token)
          const expiresAt = decodedToken.exp

          const { _id, firstName, lastName, email, role } = savedUser

          const userInfo = {
            _id,
            firstName,
            lastName,
            email,
            role
          }

          return {
            message: 'User created!',
            token,
            userInfo,
            expiresAt
          }
        } else {
          throw new ApolloError('There was a problem creating your account')
        }
      } catch (err) {
        return err
      }
    },
    addInventoryItem: async (parent, args) => {
      try {
        const user = '507f1f77bcf86cd799439011'
        const input = Object.assign({}, args, {
          user: user
        })
        const inventoryItem = new InventoryItem(input)
        const inventoryItemResult = await inventoryItem.save()
        return {
          message: 'Invetory item created!',
          inventoryItem: inventoryItemResult
        }
      } catch (err) {
        return err
      }
    },
    deleteInventoryItem: async (parent, args) => {
      try {
        const user = '507f1f77bcf86cd799439011'
        const { id } = args
        const deletedItem = await InventoryItem.findOneAndDelete({
          _id: id,
          user: user
        })
        return {
          message: 'Inventory item deleted!',
          inventoryItem: deletedItem
        }
      } catch (err) {
        return err
      }
    },
    updateUserRole: async (parent, args) => {
      try {
        const user = '507f1f77bcf86cd799439011'
        const { role } = args
        const allowedRoles = ['user', 'admin']

        if (!allowedRoles.includes(role)) {
          throw new ApolloError('Invalid user role')
        }
        const updatedUser = await User.findOneAndUpdate({ _id: user }, { role })
        return {
          message:
            'User role updated. You must log in again for the changes to take effect.',
          user: updatedUser
        }
      } catch (err) {
        return err
      }
    },
    updateUserBio: async (parent, args) => {
      try {
        const user = '507f1f77bcf86cd799439011'
        const { bio } = args
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: user
          },
          {
            bio
          },
          {
            new: true
          }
        )

        return {
          message: 'Bio updated!',
          userBio: {
            bio: updatedUser.bio
          }
        }
      } catch (err) {
        return err
      }
    }
  }
}

const typeDefs = gql`
  type Sale {
    date: String!
    amount: Int!
  }

  type DashboardData {
    salesVolume: Int!
    newCustomers: Int!
    refunds: Int!
    graphData: [Sale!]!
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    avatar: String
    bio: String
  }

  type InventoryItem {
    _id: ID!
    user: String!
    name: String!
    itemNumber: String!
    unitPrice: String!
    image: String!
  }

  type AuthenticationResult {
    message: String!
    userInfo: User!
    token: String!
    expiresAt: String!
  }

  type InventoryItemResult {
    message: String!
    inventoryItem: InventoryItem
  }

  type UserUpdateResult {
    message: String!
    user: User!
  }

  type UserBioUpdateResult {
    message: String!
    userBio: UserBio!
  }

  type UserBio {
    bio: String!
  }

  type Query {
    dashboardData: DashboardData
    users: [User]
    user: User
    inventoryItems: [InventoryItem]
    userBio: UserBio
  }

  type Mutation {
    login(email: String!, password: String!): AuthenticationResult
    signup(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): AuthenticationResult
    addInventoryItem(
      name: String!
      itemNumber: String!
      unitPrice: Float!
    ): InventoryItemResult
    deleteInventoryItem(id: ID!): InventoryItemResult
    updateUserRole(role: String!): UserUpdateResult
    updateUserBio(bio: String!): UserBioUpdateResult
  }
`

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    try {
      const token = req.headers.authorization
      if (!token) {
        return { user: null }
      }
      const decoded = jwt.verify(token.slice(7), process.env.JWT_SECRET)
      return { user: decoded }
    } catch (err) {
      return { user: null }
    }
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
  server.listen(3001).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}

connect()

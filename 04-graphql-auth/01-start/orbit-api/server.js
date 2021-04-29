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

const { SchemaDirectiveVisitor } = require('graphql-tools')
const { defaultFieldResolver } = require('graphql')

const { createToken, hashPassword, verifyPassword } = require('./util')

const checkUserRole = (user, allowableRoles) => {
  if (!user || !allowableRoles.includes(user.role)) {
    throw new AuthenticationError('Not authorized')
  }
  return true
}

// resolver = endpoint for graphql query
const resolvers = {
  Query: {
    dashboardData: (parent, args, context) => {
      const { user } = context
      checkUserRole(context.user, ['user', 'admin'])
      return dashboardData
    },
    users: async (parent, args, context) => {
      checkUserRole(context.user, ['admin'])
      try {
        return await User.find()
          .lean()
          .select('_id firstName lastName avatar bio')
      } catch (err) {
        return err
      }
    },
    user: async (parent, args, context) => {
      checkUserRole(context.user, ['user', 'admin'])
      try {
        const user = '507f1f77bcf86cd799439011'
        return await User.findOne({ _id: user })
          .lean()
          .select('_id firstName lastName role avatar bio')
      } catch (err) {
        return err
      }
    },
    inventoryItems: async (parent, args, context) => {
      checkUserRole(context.user, ['admin'])
      try {
        const user = '507f1f77bcf86cd799439011'
        return await InventoryItem.find({
          user: user
        })
      } catch (err) {
        return err
      }
    },
    userBio: async (parent, args, context) => {
      checkUserRole(context.user, ['user', 'admin'])
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
    addInventoryItem: async (parent, args, context) => {
      checkUserRole(context.user, ['admin'])
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
    deleteInventoryItem: async (parent, args, context) => {
      checkUserRole(context.user, ['admin'])
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
    updateUserRole: async (parent, args, context) => {
      checkUserRole(context.user, ['user', 'admin'])
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
    updateUserBio: async (parent, args, context) => {
      checkUserRole(context.user, ['user', 'admin'])
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
  directive @auth(requires: [Role] = [ADMIN]) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
  }

  type Sale {
    date: String!
    amount: Int!
  }

  type DashboardData @auth(requires: [USER, ADMIN]) {
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

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type)
    type._requiredAuthRole = this.args.requires
  }
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType)
    field._requiredAuthRole = this.args.requires
  }
  ensureFieldsWrapped(objectType) {
    if (objectType._authFieldsWrapped) return
    objectType._authFieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const { resolve = defaultFieldResolver } = field
      field.resolve = async function (...args) {
        const allowableRoles =
          field._requiredAuthRole || objectType._requiredAuthRole

        if (!allowableRoles || !allowableRoles.length) {
          return resolve.apply(this, args)
        }
        const context = args[2]
        const { user } = context
        if (!user) {
          throw new AuthenticationError('Not authorized')
        }
        if (
          !checkUserRole(
            user,
            allowableRoles.map((role) => role.toLowerCase())
          )
        ) {
          throw new AuthenticationError('Not authorized')
        }
        return resolve.apply(this, args)
      }
    })
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective
  },
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

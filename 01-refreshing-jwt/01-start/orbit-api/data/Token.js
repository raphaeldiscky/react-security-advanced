const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenModel = new Schema({
  refreshToken: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, required: true },
  expiresAt: { type: Date, required: true }
})

module.exports = mongoose.model('token', tokenModel)

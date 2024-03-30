const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// Bare bones schema for a user
const userSchema = mongoose.Schema({
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // A nascent way to manage 2 user roles: user and admin, since it is a small project
  joinedAt: { type: Date, default: Date.now() },
})

userSchema.plugin(uniqueValidator)
userSchema.index({ email: 1 }, { unique: true })
module.exports = mongoose.model('User', userSchema)

'use strict'
const HttpStatus = require('http-status-codes')
const bcrypt = require('bcrypt')
const User = require('../common/models/user.js')
const jwt = require('jsonwebtoken')
const { Results } = require('../common/typedefs')
const { ObjectId } = require('mongodb')

/**
 * Route middleware to signup a new user
 * @param {String} req.body.email - The email of the user
 * @param {String} req.body.password - The password set by user
 * @param {String} req.body.firstName - The first name of the user
 * @param {String} req.body.lastName - The last name of the user
 * @returns Auth token for the user to login
 */
exports.signUpUser = (req, res, next) => {
  try {
    // Sign up user
    const email = req.body.email
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName

    if (!firstName || !lastName || !email || !password) {
      throw new Error('Please provide email or password')
    }

    // Password validation
    if (!password.length > 6) {
      throw new Error('Password should be atleast 7 characters long')
    }

    // Store hashed password in database. Use 12 salt rounds instead of 10 for more complex hash
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        })

        user
          .save()
          .then((newUser) => {
            console.log('User created successfully with id', newUser._id)

            // Create authToken that will be sent to server for authorization in later requests from client
            const authToken = jwt.sign(
              { userId: newUser._id.toString() },
              process.env.AUTH_SECRET,
              { expiresIn: '24h' }, // Token will expire in 24 hrs
            )
            return res
              .status(HttpStatus.StatusCodes.OK)
              .json({ authToken, result: Results.SUCCESS })
          })
          .catch((error) => {
            console.error(error)
            return res
              .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ error: 'Some error occured. Please try again later' })
          })
      })
      .catch((error) => {
        console.error(error)
        return res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Some error occured. Please try again later' })
      })
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error })
  }
}

/**
 * Route middleware to login an existing user
 * @param {String} req.body.email - The email of the user
 * @param {String} req.body.password - The password set by user
 * @returns Auth token, firstName and lastName of user
 */
exports.logInUser = (req, res, next) => {
  try {
    // Manual sign-in validation
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
      throw new Error('Please provide email and password')
    }

    // Find user by their email, and get stored password
    User.findOne(
      { email },
      { password: 1, firstName: 1, lastName: 1, _id: 1 },
    ).then((user) => {
      const savedHashedPassword = user.password
      const userId = user._id.toString()

      // Check if user's entered password matches the saved hashed password
      bcrypt
        .compare(password, savedHashedPassword)
        .then((match) => {
          if (!match) {
            // Don't tell exact reason that password didn't match, in case if user is just fishing
            throw new Error('Email or password invalid')
          }

          // Send authToken along with some basic data back like user's name. Further data can be loaded in later API calls based on application needs

          const authToken = jwt.sign(
            { userId },
            process.env.AUTH_SECRET,
            { expiresIn: '24h' }, // Token will expire in 24 hrs
          )
          return res.status(HttpStatus.StatusCodes.OK).json({
            authToken,
            firstName: user.firstName,
            lastName: user.lastName,
            result: Results.SUCCESS,
          })
        })

        .catch((error) => {
          console.error(error)
          return res
            .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Some error occured. Please try again later' })
        })
    })
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error })
  }
}

/**
 * Route middleware to validate auth token of user before they can perform any action that needs authorization
 * @param {String} req.headers.authtoken - The auth token of the user
 * @returns {Function} - Calls next function in middleware
 */
exports.validateUserAuthToken = (req, res, next) => {
  try {
    // Extract user id here from JWT, and attach it to req object
    const authToken = req.headers.authtoken
    if (!authToken) {
      throw new Error('Unauthenticated session. Please login again')
    }

    const authData = jwt.verify(authToken, process.env.AUTH_SECRET)
    req.userId = authData.userId
    next()
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.UNAUTHORIZED)
      .json({ error: 'Unauthenticated session. Please login again' })
  }
}

/**
 * Route middleware to validate if the current user is admin before they can perform any action that can only be performed by admin
 * @param {String} req.userId - The userId of the user
 * @returns {Function} - Calls next function in middleware
 */
exports.isUserAdmin = (req, res, next) => {
  try {
    // Check if user is admin
    const userId = req.userId
    User.findById(ObjectId(userId), { isAdmin: 1 }).then((user) => {
      if (!user.isAdmin) {
        throw new Error('You are not authorized to perform this operation')
      }

      req.userIsAdmin = true
      next()
      return
    })
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.UNAUTHORIZED)
      .json({ error: 'Unauthenticated session. Please login again' })
  }
}

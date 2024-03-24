const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth')

// Sign new user up
router.post('/user-signup', AuthController.signUpUser)

// Login user
router.post('/user-login', AuthController.logInUser)

module.exports = router

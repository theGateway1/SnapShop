const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth')
const AdminController = require('../controllers/admin-controls')

router.post(
  '/create-discount-code',
  AuthController.validateUserAuthToken,
  AuthController.isUserAdmin,
  AdminController.createDiscountCode,
)

router.get()

module.exports = router

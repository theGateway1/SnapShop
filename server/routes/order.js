const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth')
const OrderController = require('../controllers/order')

// Create new order
router.post(
  '/create-order',
  AuthController.validateUserAuthToken,
  OrderController.createNewOrder,
)

module.exports = router

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

// Request discount code: Will only return success if current order is nth order
router.get(
  '/request-discount-code',
  AuthController.validateUserAuthToken,
  OrderController.checkDiscountCodeExists,
)

module.exports = router

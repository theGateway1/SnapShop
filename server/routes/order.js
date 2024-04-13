const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth')
const OrderController = require('../controllers/order')

// Create order invoice
router.post(
  '/create-order-invoice',
  AuthController.validateUserAuthToken,
  OrderController.createOrder,
)

// Request discount code: Will only return success if current order is nth order
router.get(
  '/request-discount-code',
  AuthController.validateUserAuthToken,
  OrderController.checkDiscountCodeExists,
)

module.exports = router

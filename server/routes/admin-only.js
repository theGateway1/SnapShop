const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth')
const AdminController = require('../controllers/admin-controls')

// Routes only accessible by the admin account

router.post(
  '/create-discount-code',
  AuthController.validateUserAuthToken,
  AuthController.isUserAdmin,
  AdminController.createDiscountCode,
)

router.get(
  '/items-purchased-list',
  AuthController.validateUserAuthToken,
  AuthController.isUserAdmin,
  AdminController.getItemsPurchasedList,
)

router.get(
  '/discount-codes-list',
  AuthController.validateUserAuthToken,
  AuthController.isUserAdmin,
  AdminController.getDiscountCodesList,
)

router.get(
  '/total-discount-amount',
  AuthController.validateUserAuthToken,
  AuthController.isUserAdmin,
  AdminController.getTotalDiscountAmount,
)

router.get(
  '/total-purchase-amount',
  AuthController.validateUserAuthToken,
  AuthController.isUserAdmin,
  AdminController.getTotalPurchaseAmount,
)

module.exports = router

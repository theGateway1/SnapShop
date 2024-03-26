const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product')
const AuthController = require('../controllers/auth')

// Get list of products for home page
router.get(
  '/get-products/:page',
  AuthController.validateUserAuthToken, // User should be authenticated
  ProductController.getProducts,
)

module.exports = router

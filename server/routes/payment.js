const express = require('express')
const router = express.Router()
const PaymentController = require('../controllers/payments')

// Post payment actions

/**
 * This endpoint should not check for user's AuthToken as this endpoint is generally call by third party like Razorpay, or other payment gateway, so it won't have user's authToken in header.
 * But these providers provide a way to verify that the webhook is being called by them through signature verification or other means (out of scope of this project)
 */
router.post('/make-payment', PaymentController.makePayment)

module.exports = router

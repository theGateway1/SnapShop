const express = require('express')
const router = express.Router()
const PaymentController = require('../controllers/payments')

// Post payment actions

/**
 * This endpoint will be call by Razorpay after user has made payment, and it will perform post-payment actions.
 */
router.post('/razorpay-pmt-captured', PaymentController.makePayment)

module.exports = router

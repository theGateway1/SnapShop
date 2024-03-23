'use strict'
const HttpStatus = require('http-status-codes')
const DiscountCode = require('../common/models/discount-code')

// Controller for admin-only methods

/**
 * Helper function to create new discount code
 * @param {Request} orderId - The orderId for which this code will be used
 * @param {Request} discountPercent - The discount in percentage being applied
 * @param {Request} discountAmount - The amount being discounted
 * @returns Discount Code
 */
exports.createDiscountCodeHelper = (
  orderId,
  discountPercent,
  discountAmount,
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!orderId || !discountAmount || !discountPercent) {
        throw new Error('Missing request parameters')
      }

      // Generate discount code
      const discountCode = new DiscountCode({})
    } catch (error) {}
  })
}

/**
 * Route middleware to create new discount code using the helper
 * @param {Request} req.body.orderId - The orderId for which this code will be used
 * @param {Request} req.body.discountPercent - The discount in percentage being applied
 * @param {Request} req.body.discountAmount - The amount being discounted
 * @returns Discount Code
 */
exports.createDiscountCode = (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const discountPercent = req.body.discountPercent
    const discountAmount = req.body.discountAmount

    if (!orderId || !discountAmount || !discountPercent) {
      throw new Error('Missing request parameters')
    }

    // Generate discount code using helper
    this.createDiscountCodeHelper(orderId, discountPercent, discountAmount)
      .then((discountCode) => {
        req.discountCode = discountCode
        next()
      })
      .catch((error) => {
        console.error(error)
        res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
      })
  } catch (error) {
    console.error(error)
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

exports.getItemsPurchasedList = (req, res, next) => {
  // Get list of items purchased
}

exports.getTotalPurchaseAmount = (req, res, next) => {
  // Get total purchase amount
}

exports.getDiscountCodesList = (req, res, next) => {
  // Get discount codes list
}

exports.getTotalDiscountAmount = (req, res, next) => {
  // Get total discount amount
}

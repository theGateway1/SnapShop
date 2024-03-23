'use strict'
const HttpStatus = require('http-status-codes')
const DiscountCode = require('../common/models/discount-code')
const { ObjectId } = require('mongodb')

// Controller for admin-only methods

/**
 * Helper function to create new discount code
 * @param {String} orderId - The orderId for which this code will be used
 * @param {Number} discountPercent - The discount in percentage being applied
 * @param {Number} discountAmount - The amount being discounted
 * @returns Discount Code (String)
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
      const discountCode = new DiscountCode({
        discountPercent,
        discountAmount,
        orderId: ObjectId(orderId),
      })

      discountCode
        .save()
        .then((newDiscountCode) => {
          console.log('Discount code created', newDiscountCode._id.toString())
          resolve(newDiscountCode._id.toString())
        })
        .catch((error) => {
          console.error(error)
          reject(error)
        })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

/**
 * Route middleware to create new discount code using the helper
 * @param {String} req.body.orderId - The orderId for which this code will be used
 * @param {Number} req.body.discountPercent - The discount in percentage being applied
 * @param {Number} req.body.discountAmount - The amount being discounted
 * @returns Discount Code (String)
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

/**
 * Route middleware to list count of items purchased
 * @returns List of items purchased in the form: [{itemName, purchasedCount}]
 */
exports.getItemsPurchasedList = (req, res, next) => {
  // Get list of items purchased
}

/**
 * Route middleware to get total purchased amount
 * @returns Total purchased amount (Number)
 */
exports.getTotalPurchaseAmount = (req, res, next) => {
  // Get total purchase amount
}

/**
 * Route middleware to get list of all the discount codes
 * @returns List of all the existing discount codes
 */
exports.getDiscountCodesList = (req, res, next) => {
  // Get discount codes list
}

/**
 * Route middleware to get total discount amount
 * @returns Total discount amount (Number)
 */
exports.getTotalDiscountAmount = (req, res, next) => {
  // Get total discount amount
}

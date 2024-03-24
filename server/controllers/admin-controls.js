'use strict'
const HttpStatus = require('http-status-codes')
const DiscountCode = require('../common/models/discount-code')
const { ObjectId } = require('mongodb')
const Item = require('../common/models/item')
const Order = require('../common/models/order')

// Controller for admin-only methods

/**
 * An internal (unexposed) helper function to create new discount code
 * @param {String} orderId - The orderId for which this code will be used
 * @param {Number} discountPercent - The discount in percentage being applied
 * @param {Number} discountAmount - The amount being discounted
 * @returns {Promise<String>} Discount Code (String)
 */
exports.createDiscountCodeHelper = (
  orderId,
  discountPercent,
  discountAmount,
) => {
  /** 
   This method is called internally and by design it is not part of any route middleware, so only server can access it, hence there is no need to explicitly verify that user is admin or not
  */

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
    // Only admin access is allowed to this API
    if (!req.userIsAdmin) {
      throw new Error('User unathorized to perform this action')
    }

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
  try {
    // Only admin access is allowed to this API
    if (!req.userIsAdmin) {
      throw new Error('User unathorized to perform this action')
    }

    // Get all items from database along with their name, id and purchasedCount
    Item.find({}, { _id: 1, itemName: 1, purchasedCount: 1 })
      .then((items) => {
        res.status(HttpStatus.StatusCodes.OK).json({ items })
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
 * Route middleware to get total purchased amount
 * @returns Total purchased amount (Number)
 */
exports.getTotalPurchaseAmount = (req, res, next) => {
  try {
    // Only admin access is allowed to this API
    if (!req.userIsAdmin) {
      throw new Error('User unathorized to perform this action')
    }

    // For all orders in the database keep adding the value in field orderValueInPaiseAfterDiscount, and return the result
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalPurchaseAmount: { $sum: '$orderValueInPaiseAfterDiscount' },
        },
      },
    ]).toArray((error, result) => {
      if (error) {
        throw new Error(error)
      }

      if (!result.length || !result[0]?.totalPurchaseAmount) {
        throw new Error('Result missing total purchase amount')
      }

      res
        .status(HttpStatus.StatusCodes.OK)
        .json({ totalPurchaseAmount: result[0].totalPurchaseAmount })
    })
  } catch (error) {
    console.error(error)
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

/**
 * Route middleware to get list of all the discount codes
 * @returns List of all the existing discount codes
 */
exports.getDiscountCodesList = (req, res, next) => {
  try {
    // Only admin access is allowed to this API
    if (!req.userIsAdmin) {
      throw new Error('User unathorized to perform this action')
    }

    // As mentioned in design details of discount code schema, the _id created by mongoose is always unique, and hence it is the most convinient way to avoid hassle of generating unique codes manually
    DiscountCode.find({}, { _id: 1, discountPercent: 1, discountAmount: 1 })
      .then((disCountCodes) => {
        res.status(HttpStatus.StatusCodes.OK).json({ disCountCodes })
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
 * Route middleware to get total discount amount
 * @returns Total discount amount (Number)
 */
exports.getTotalDiscountAmount = (req, res, next) => {
  try {
    // Only admin access is allowed to this API
    if (!req.userIsAdmin) {
      throw new Error('User unathorized to perform this action')
    }

    // For all discount codes in the database keep adding the value in field discountAmount, and return the result
    DiscountCode.aggregate([
      {
        $group: {
          _id: null,
          totalDiscountAmount: { $sum: '$discountAmount' },
        },
      },
    ]).toArray((error, result) => {
      if (error) {
        throw new Error(error)
      }

      if (!result.length || !result[0]?.totalDiscountAmount) {
        throw new Error('Result missing total discount amount')
      }

      res
        .status(HttpStatus.StatusCodes.OK)
        .json({ totalDiscountAmount: result[0].totalDiscountAmount })
    })
  } catch (error) {
    console.error(error)
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
  }
}

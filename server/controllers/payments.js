const { ObjectId } = require('mongodb')
const HttpStatus = require('http-status-codes')
const Order = require('../common/models/order')
const {
  OrderStatus,
  Results,
  DiscountCodeStatus,
} = require('../common/typedefs')
const DiscountCode = require('../common/models/discount-code')
const Item = require('../common/models/item')

/**
 * This API will be called by a Razorpay after payment is made for an invoice, to perform the post payment actions.
 * @param {String} req.body.orderId - The orderId for which payment has been made
 * @param {String} req.body.discountCode - Discount code applied to order (if any)
 * @returns {void} - Performs post payment actions
 */
exports.makePayment = (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const discountCode = req.body.discountCode
    const discountAmount = req.body.discountAmount
    const discountPercent = req.body.discountPercent

    if (!orderId) {
      throw new Error('Missing invoice id or order id')
    }

    // Update order status to paid and fetch itemsList
    Order.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { status: OrderStatus.PAID } },
      { returnOriginal: false }, // To get the updated document
    )
      .then((result) => {
        const itemsList = result.orderItems

        /**
         * Operations to be performed for each item purchased in itemsList
         * 1. Increase item purchasedCount
         * 2. Update item count in database, based on quantity of item purchased
         */

        const promises = itemsList.map((item) => {
          const itemId = item._id
          const qtyPurchased = item.quantity

          // Update the corresponding item in the items collection
          return Item.findOneAndUpdate(
            { _id: new ObjectId(itemId) },
            {
              $inc: {
                purchasedCount: qtyPurchased, // Increase item purchasedCount
                availableQty: -qtyPurchased, // Decrease availableQty of item
              },
            },
            { returnOriginal: false }, // To get the updated document
          )
        })

        return Promise.all(promises)
      })
      .catch((error) => {
        // Failing to update above collections post-payment is fatal, send error back
        console.error(error)
        return res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: Results.INTERNAL_SERVER_ERROR })
      })
      .then(() => {
        // Update discount code status to USED, update the discount amount and percentage that this code provided, and the corresponding orderId
        if (!discountCode) {
          return
        }

        return DiscountCode.findOneAndUpdate(
          { _id: new ObjectId(discountCode) },
          {
            status: DiscountCodeStatus.USED,
            discountAmount,
            discountPercent,
            orderId: new ObjectId(orderId),
          },
        )
      })
      .then(() => {
        console.log('Completed post payment actions')
        return res
          .status(HttpStatus.StatusCodes.OK)
          .json({ result: Results.SUCCESS })
      })
      .catch((error) => {
        // Failing to update discount code status is not fatal - Send success
        console.error('Failed to update discount code status', error)
        console.log('Anyways, returning success')

        return res
          .status(HttpStatus.StatusCodes.OK)
          .json({ result: Results.SUCCESS })
      })
  } catch (error) {
    console.error('Post payment actions failed', error)
    return res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: Results.INTERNAL_SERVER_ERROR })
  }
}

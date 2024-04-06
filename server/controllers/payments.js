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
 * A dummy API for POC of this application, because after order generation, invoice needs to be created - So this API stimulates that. Please refer to method createNewOrder() in controllers/order.js
 * @param {String} orderId - The orderId for which invoice needs to be generated
 * @param {Number} billAmount - The amount for which invoice needs to be generated
 * @param {String} discountCode - (Optional) Discount code applied to this order (if any), and its details
 * @returns Creates payment invoice for an order
 */
exports.generateInvoice = (
  orderId,
  billAmount,
  discountAmount,
  discountPercent,
  discountCode,
) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const invoiceId = new ObjectId()
      console.log('Invoice generated with ID:', invoiceId)
      resolve(invoiceId)
    }, 1000)
  })
}

/**
 * A dummy API for POC of this application, it will be called by a 3rd party (like Razorpay) after payment is made for an invoice, to perform the post payment actions.
 * For the purpose of this application, it will be called by the server after clicking make payment button
 * @param {String} req.body.invoiceId - The invoiceId for which payment has been made
 * @param {String} req.body.orderId - The orderId for which payment has been made
 * @param {String} req.body.discountCode - discountCode applied to order (if any)
 * @returns {void} - Performs post payment actions
 */
exports.makePayment = (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const invoiceId = req.body.invoiceId
    const discountCode = req.body.discountCode

    if (!invoiceId || !orderId) {
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
            discountAmount: req.body.discountAmount,
            discountPercent: req.body.discountPercent,
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

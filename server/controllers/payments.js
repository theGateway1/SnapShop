const { ObjectId } = require('mongodb')
const HttpStatus = require('http-status-codes')
const Order = require('../common/models/order')
const { OrderStatus, Results } = require('../common/typedefs')

/**
 * This is a hypothetical API for POC of this application, because after order generation, invoice needs to be created - So this API stimulates that. Please refer to method createNewOrder() in controllers/order.js
 * @param {String} orderId - The orderId for which invoice needs to be generated
 * @param {Number} billAmount - The amount for which invoice needs to be generated
 * @returns Creates payment invoice for an order
 */
exports.generateInvoice = (orderId, billAmount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const invoiceId = new ObjectId()
      console.log('Invoice generated with ID:', invoiceId)
      resolve(invoiceId)
    }, 1000)
  })
}

/**
 * Another hypothetical API for POC of this application, it will be called by a 3rd party (like Razorpay) after payment is made for an invoice, to perform the post payment actions
 * @param {String} req.body.invoiceId - The invoiceId for which payment has been made
 * @param {String} req.body.orderId - The orderId for which payment has been made
 * @returns {void} - Performs post payment actions
 */
exports.postPaymentActions = (req, res, next) => {
  try {
    const orderId = req.body.orderId
    const invoiceId = req.body.invoiceId

    if (!invoiceId || !orderId) {
      throw new Error('Missing invoice id or order id')
    }

    // Update order status to paid and fetch itemsList
    Order.findOneAndUpdate(
      { _id: ObjectId(orderId) },
      { $set: { status: OrderStatus.PAID } },
      { returnOriginal: false }, // To get the updated document
    )
      .then((result) => {
        const itemsList = result.value.itemsPurchased

        /**
         * Operations to be performed for each item purchased in itemsList
         * 1. Increase item purchasedCount
         * 2. Update item count in database, based on quantity of item purchased
         */

        const promises = itemsList.map((item) => {
          const itemId = item.itemId
          const qtyPurchased = item.quantity

          // Update the corresponding item in the items collection
          return itemsCollection.findOneAndUpdate(
            { _id: ObjectId(itemId) },
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
        console.error(error)
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: Results.INTERNAL_SERVER_ERROR })
      })
      .then(() => {
        console.log('Completed post payment actions')
        res.status(HttpStatus.StatusCodes.OK).json({ result: Results.SUCCESS })
      })
  } catch (error) {
    console.error(error)
    res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: Results.INTERNAL_SERVER_ERROR })
  }
}

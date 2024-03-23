const { ObjectId } = require('mongodb')

/**
 * This is just a hypothetical API for POC of this application, because after order generation, invoice needs to be created - So this API stimulates that. Please refer to method createNewOrder() in controllers/order.js
 * @param {Request} orderId - The orderId for which invoice needs to be generated
 * @param {Request} billAmount - The amount for which invoice needs to be generated
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

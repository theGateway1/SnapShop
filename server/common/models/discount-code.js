const mongoose = require('mongoose')

// Schema for a discount code

/**
 * Design decisions made for this schema:
 * 1. Storing discount amount here will make it easier to retreive total discountAmount, by just going through each document and adding the this field
 * 2. Instead of creating a unique code everytime in the server, and verifying whether it is unique or not, let mongoDB's unique document ID generation handle that for us.
 * 3. When a discount code is used, i.e. payment is made for an order with discount code, the corresponding order Id will be stored in database.
 */

const discountCodeSchema = mongoose.Schema({
  discountPercent: { type: Number, min: 1, max: 100, required: false },
  discountAmount: { type: Number, min: 0, required: false }, // The amount that this discount coupon waived off
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
  },
  status: { type: String, required: true }, // Refer DiscountCodeStatus in 'server/common/typedefs'
})

module.exports = mongoose.model('DiscountCode', discountCodeSchema)

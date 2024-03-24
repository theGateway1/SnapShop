const mongoose = require('mongoose')

// Schema for a discount code

/**
 * Design decisions made for this schema:
 * 1. Storing discount amount here will make it easier to retreive total discountAmount, by just going through each document and adding the this field
 * 2. Instead of creating a unique code everytime in the server, and verifying whether it is unique or not, let mongoDB's unique document ID generation handle that for us.
 * 3. Discount code will be generated for a particular order, the orderId in the schema will point to that particular order
 */

const discountCodeSchema = mongoose.Schema({
  discountPercent: { type: Number, min: 1, max: 100, required: true },
  discountAmount: { type: Number, min: 0, required: true }, // The amount that this discount coupon waived off
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
})

module.exports = mongoose.model('DiscountCode', discountCodeSchema)

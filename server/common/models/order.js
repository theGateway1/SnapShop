const mongoose = require('mongoose')

// Schema for a order

const itemsPurchasedSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 }, // Since price of an item can fluctuate, this will help keep track of amount user paid for this item, in case refund needs to be issued
})

const orderSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderValueInPaiseAfterDiscount: { type: Number, required: true, min: 0 }, // The bill will be generated for this amount
  orderValueInPaiseBeforeDiscount: { type: Number, required: true, min: 0 }, // This metrics might help somewhere
  discountAmountInPaise: { type: Number, default: 0, min: 0 },
  status: { type: String, required: true }, // Order status like - placed, cancelled, shipped
  createdOn: { type: Date, required: true },
  orderItems: { type: [itemsPurchasedSchema], required: true }, // Array of items and their respective quantity
  discountCode: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCode' },
  razorpayOrderId: { type: String, required: true }, // Razorpay order Id
})

module.exports = mongoose.model('Order', orderSchema)

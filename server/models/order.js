const mongoose = require('mongoose')

// Schema for a order

const itemsPurchasedSchema = mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 0 },
})

const orderSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalValueInPaise: { type: Number, required: true },
  status: { type: String, required: true }, // Order status like - placed, cancelled, shipped
  createdOn: { type: Date, required: true },
  itemsPurchased: { type: [itemsPurchasedSchema], required: true }, // Array of items and their respective quantity
})

module.exports = mongoose.model('Order', orderSchema)

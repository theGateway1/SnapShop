const mongoose = require('mongoose')

// Schema for an item

const itemSchema = mongoose.Schema({
  // mongoose will by default assign an id, so no need to specify that explicitly
  itemName: { type: String, required: true },
  availableQty: { type: Number, min: 0, required: true },
  priceInPaise: { type: Number, min: 0, required: true },
  purchasedCount: { type: Number, default: 0, min: 0 },
})

module.exports = mongoose.model('Item', itemSchema)

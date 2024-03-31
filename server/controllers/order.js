'use strict'
const HttpStatus = require('http-status-codes')
const { Results, OrderStatus } = require('../common/typedefs')
const { ObjectId } = require('mongodb')
const Item = require('../common/models/item')
const Order = require('../common/models/order')
const AdminController = require('./admin-controls')
const PaymentsController = require('./payments')
// Controller for Order related methods

/**
 * Middleware function to create new order
 * @param {Array} req.body.itemsList - The list of items in format: [{itemId, itemQty}]
 * @returns Creates order and generates payment invoice for newly created order
 */
exports.createNewOrder = (req, res, next) => {
  try {
    const userId = req.userId
    const itemsList = req.body.itemsList
    const existingDiscountCode = req.body.discountCode // Discount received by user when they clicked get discount code
    let orderValueInPaiseBeforeDiscount = 0
    let orderValueInPaiseAfterDiscount = 0
    let discountAmount = 0
    const orderId = new ObjectId() // This needs to be passed to createDiscountCode method before creating an order, so have it generated beforehand
    let itemsPurchased = []
    var discountPercent // Will be assigned value later conditionally

    if (!itemsList?.length) {
      throw new Error('Failed to create order. No items found')
    }

    // Fetch price of each item from database and check if available quantity > 0
    Item.aggregate([
      {
        $match: {
          _id: { $in: itemsList.map((item) => item.itemId) }, // Filter for items in the list
        },
      },
      {
        $project: {
          _id: 1,
          availableQty: 1,
          priceInPaise: 1,
          itemName: 1,
        },
      },
    ])
      .then((dbItemsList) => {
        if (!dbItemsList?.length) {
          throw new Error('Items not found')
        }

        /**
        Check if the quantity user has entered is available in store or not, and calculate the total price for each item here, don't trust any value from frontend, and populate itemsPurchased list
        */

        itemsPurchased = itemsList.map((item) => {
          const dbItem = dbItemsList.find((dbItem) =>
            dbItem._id.equals(item._id),
          )
          if (dbItem?.availableQty < item.itemQty) {
            // This can be handled in different ways, but for simplicity, let's throw an error
            throw new Error(
              `Only ${dbItem.availableQty} units of ${dbItem.itemName} are left`,
            )
          }

          // Keep calculating total order value
          orderValueInPaiseBeforeDiscount += dbItem.priceInPaise * itemQty

          return {
            itemId: item._id,
            quantity: itemQty,
            pricePerUnit: dbItem.priceInPaise,
          }
        })

        // If user has come up with a discount code, skip checking for order count & creating a new discount
        if (existingDiscountCode) {
          return
        } else {
          // Get existing document count of orders collection
          return Order.countDocuments()
        }
      })
      .then((existingOrdersCount) => {
        /**
         Check if this order is eligible for discount, whether this is nth order
         */

        const currentOrderCount = existingOrdersCount
          ? existingOrdersCount + 1
          : 0 // The current order being placed is existingOrdersCount + 1

        if (
          existingDiscountCode ||
          currentOrderCount % process.env.NTH_ORDER_COUNT == 0
        ) {
          discountPercent = 10
          discountAmount = 0.1 * orderValueInPaiseBeforeDiscount // Apply 10% discount
          orderValueInPaiseAfterDiscount =
            orderValueInPaiseBeforeDiscount - discountAmount

          // Generate discount code for this order
          return AdminController.createDiscountCodeHelper(discountPercent)
        } else {
          orderValueInPaiseAfterDiscount = orderValueInPaiseBeforeDiscount
        }
      })
      .then((discountCode) => {
        /**
        At this point we have all the field values needed to create an order, whether discount needs to be applied or not, discountCode will have some value or will be undefined. Now, create new order.
        */

        // Shred everything after 2 decimal places
        orderValueInPaiseAfterDiscount =
          orderValueInPaiseAfterDiscount.toFixed(2)
        orderValueInPaiseBeforeDiscount =
          orderValueInPaiseBeforeDiscount.toFixed(2)
        discountAmount = discountAmount.toFixed(2)

        const order = new Order({
          _id: orderId, // Use the orderId that was already created
          userId: ObjectId(userId),
          status: OrderStatus.CREATED,
          createdOn: new Date(),
          itemsPurchased,
          orderValueInPaiseAfterDiscount,
          orderValueInPaiseBeforeDiscount,
          discountAmount,
          discountCode: ObjectId(discountCode),
        })

        return order.save()
      })
      .then(() => {
        /**
         Since this is an e-commerce application, let's call generateInvoice API, for which client will make payment
        */

        return PaymentsController.generateInvoice(
          orderId,
          orderValueInPaiseAfterDiscount,
          discountAmount,
          discountPercent,
        )
      })
      .then((invoiceId) => {
        /** 
         Now send the invoice back to client for them to make payment and place the order
        */
        console.log(
          'Created order successfully, sending invoice to user',
          invoiceId,
        )
        return res.status(HttpStatus.StatusCodes.OK).json({
          orderId,
          invoiceId,
          orderValueInPaiseAfterDiscount,
          orderValueInPaiseAfterDiscount,
          discountAmount,
          itemsPurchased,
          result: Results.SUCCESS,
        })
      })
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: Results.INTERNAL_SERVER_ERROR })
  }
}

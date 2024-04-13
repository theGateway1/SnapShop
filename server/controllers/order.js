'use strict'
const HttpStatus = require('http-status-codes')
const { Results, OrderStatus } = require('../common/typedefs')
const { ObjectId } = require('mongodb')
const Item = require('../common/models/item')
const Order = require('../common/models/order')
const AdminController = require('./admin-controls')
const PaymentsController = require('./payments')
const { formatPaisePrice, paisetoRupee } = require('./common-controller')
const Razorpay = require('razorpay')
const razorpay = new Razorpay({
  key_id: process.env.RZPAY_KEY_ID,
  key_secret: process.env.RZPAY_KEY_SECRET,
})

// Controller for Order related methods

/**
 * Middleware function to generate a new order
 * @param {Array} req.body.itemsList - The list of items in format: [{itemId, itemQuantity}]
 * @param {String} req.body.discountCode - (Optional) If user has received a discount code. This code will be validated here.
 * @returns Creates order and generates payment invoice for newly created order
 */
exports.createOrder = (req, res, next) => {
  try {
    const userId = req.userId
    const itemsList = req.body.itemsList
    const existingDiscountCode = req.body.discountCode // Discount received by user when they clicked get discount code
    let orderValueInPaiseBeforeDiscount = 0
    let orderValueInPaiseAfterDiscount = 0
    let discountAmount = 0
    const orderId = new ObjectId() // This needs to be passed to createDiscountCode method before creating an order, so have it generated beforehand
    let updatedCart = [] // To be sent back to client
    let orderItems = [] // To be stored in database for order record
    var discountPercent // Will be assigned value later conditionally
    var discountCodeApplied
    var discountValue

    if (!itemsList?.length) {
      throw new Error('Failed to create order. No items found')
    }

    // Fetch price of each item from database and check if available quantity > 0
    Item.aggregate([
      {
        $match: {
          _id: { $in: itemsList.map((item) => new ObjectId(item._id)) }, // Filter for items in the list
        },
      },
      {
        $project: {
          _id: 1,
          availableQty: 1,
          priceInPaise: 1,
          itemName: 1,
          imgSrc: 1,
          availableQty: 1,
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

        itemsList.forEach((item) => {
          const dbItem = dbItemsList.find((dbItem) =>
            dbItem._id.equals(item._id),
          )
          if (dbItem?.availableQty < item.quantity) {
            // This can be handled in different ways, but for simplicity, let's throw an error
            throw new Error(
              `Only ${dbItem.availableQty} units of ${dbItem.itemName} are left`,
            )
          }

          // Keep calculating total order value
          orderValueInPaiseBeforeDiscount += dbItem.priceInPaise * item.quantity

          updatedCart.push({
            _id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: paisetoRupee(dbItem.priceInPaise),
            imgSrc: item.imgSrc,
            availableQty: item.availableQty,
          })

          orderItems.push({
            _id: item._id,
            quantity: item.quantity,
            price: dbItem.priceInPaise,
          })
        })

        // Assing orderValueInPaiseAfterDiscount = orderValueInPaiseBeforeDiscount, if there is any discount code, the price will be update below
        orderValueInPaiseAfterDiscount = orderValueInPaiseBeforeDiscount

        // If user has come up with a discount code, skip checking for order count & creating a new discount
        if (existingDiscountCode) {
          return
        } else {
          // Get existing document count of orders collection
          return Order.countDocuments()
        }
      })
      .then((existingOrdersCount) => {
        if (existingDiscountCode) {
          return
        }
        /**
         Check if this order is eligible for discount, whether this is nth order
        */

        const currentOrderCount = existingOrdersCount + 1 // The current order being placed is existingOrdersCount + 1

        if (currentOrderCount % process.env.NTH_ORDER_COUNT == 0) {
          discountPercent = 10
          discountValue = '10%' // To be shown to user
          discountAmount = 0.1 * orderValueInPaiseBeforeDiscount // Apply 10% discount
          orderValueInPaiseAfterDiscount =
            orderValueInPaiseBeforeDiscount - discountAmount

          // Generate discount code for this order
          return AdminController.createDiscountCodeHelper(discountPercent)
        }
      })
      .then((newDiscountCode) => {
        // At this stage validate existing discount code (if exists)

        // If new discount code is generated, then there is nothing to validate
        if (newDiscountCode) {
          discountCodeApplied = newDiscountCode
          return
        }

        if (!existingDiscountCode) {
          return
        }

        return AdminController.validateDiscountCode(existingDiscountCode)
      })
      .then((codeDetails) => {
        // Only accept this code if it is valid
        if (codeDetails?.validCode) {
          discountCodeApplied = existingDiscountCode
          discountPercent = codeDetails.discountPercent
          discountValue = `${discountPercent}%` // To be shown to user
          discountAmount =
            (discountPercent / 100) * orderValueInPaiseBeforeDiscount // Apply discount

          orderValueInPaiseAfterDiscount =
            orderValueInPaiseBeforeDiscount - discountAmount
        }
      })
      .then(async () => {
        /**
        At this point we have all the field values needed to create an order, whether discount needs to be applied or not, discountCode will have some value or will be undefined. Now, create new order.
        */

        // Format price: shred everything after 2 decimal places
        orderValueInPaiseAfterDiscount = formatPaisePrice(
          orderValueInPaiseAfterDiscount,
        )

        orderValueInPaiseBeforeDiscount = formatPaisePrice(
          orderValueInPaiseBeforeDiscount,
        )
        discountAmount = formatPaisePrice(discountAmount)

        const razorpayOrder = await razorpay.orders.create({
          amount: orderValueInPaiseAfterDiscount,
          currency: 'INR',
          receipt: 'receipt#1',
          notes: {
            orderId: orderId.toString(),
            discountCode: discountCodeApplied?.toString(),
            discountAmount,
            discountPercent,
          },
        })

        console.log('RZP Order:', razorpayOrder)

        const order = new Order({
          _id: orderId, // Use the orderId that was already created
          razorpayOrderId: razorpayOrder.id,
          userId: new ObjectId(userId),
          status: OrderStatus.CREATED,
          createdOn: new Date(),
          orderItems,
          orderValueInPaiseAfterDiscount,
          orderValueInPaiseBeforeDiscount,
          discountAmountInPaise: discountAmount,
          discountCode: discountCodeApplied
            ? new ObjectId(discountCodeApplied)
            : null,
        })

        return order.save()
      })

      .then(() => {
        /** 
         Now send the invoice back to client for them to make payment and place the order
        */
        return res.status(HttpStatus.StatusCodes.OK).json({
          orderId,
          orderValueInPaiseAfterDiscount: paisetoRupee(
            orderValueInPaiseAfterDiscount,
          ),
          orderValueInPaiseAfterDiscount: paisetoRupee(
            orderValueInPaiseAfterDiscount,
          ),
          discountAmount: paisetoRupee(discountAmount),
          updatedCart,
          discountCode: discountCodeApplied?.toString(),
          discountPercent,
          discountValue,
          result: Results.SUCCESS,
        })
      })
      .catch((error) => {
        console.error(error)
        return res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: Results.INTERNAL_SERVER_ERROR })
      })
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: Results.INTERNAL_SERVER_ERROR })
  }
}

/**
 * Middleware function to check if a discount code can be alloted to the user based on order number. If it can be alloted, it generates the discount code and returns it.
 * @returns Discount Code
 */
exports.checkDiscountCodeExists = (req, res, next) => {
  try {
    var discountPercent
    Order.countDocuments()
      .then((existingOrdersCount) => {
        /**
        Check if this order is eligible for discount, whether this is nth order
        */

        // The current order being placed is existingOrdersCount + 1
        const currentOrderCount = existingOrdersCount + 1

        // Let's say 10% discount needs to be applied on every 5th order, then NTH_ORDER_COUNT will be 5 (it is saved as env. variable)
        if (currentOrderCount % process.env.NTH_ORDER_COUNT == 0) {
          // Generate discount code for this order
          discountPercent = 10
          return AdminController.createDiscountCodeHelper(discountPercent)
        }
      })
      .then((discountCode) => {
        if (discountCode) {
          return res.status(HttpStatus.StatusCodes.OK).json({
            discountCode,
            discountValue: `${discountPercent}%`,
            discountPercent,
          })
        } else {
          return res
            .status(HttpStatus.StatusCodes.OK)
            .json({ message: 'Discount code not found' })
        }
      })
      .catch((error) => {
        console.error(error)
        return res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: Results.INTERNAL_SERVER_ERROR })
      })
  } catch (error) {
    console.error(error)
    return res
      .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: Results.INTERNAL_SERVER_ERROR })
  }
}

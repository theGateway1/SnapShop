'use strict'
const HttpStatus = require('http-status-codes')
const { Results, OrderStatus } = require('../common/typedefs')
const { ObjectId } = require('mongodb')
const Item = require('../common/models/item')
const Order = require('../common/models/order')
const AdminController = require('./admin-controls')
const PaymentsController = require('./payments')
const { formatPaisePrice, paisetoRupee } = require('./common-controller')

// Controller for Order related methods

/**
 * Middleware function to save a new order and generate its invoice
 * @param {Array} req.body.itemsList - The list of items in format: [{itemId, itemQuantity}]
 * @param {String} req.body.discountCode - (Optional) If user has received a discount code. This code will be validated here.
 * @returns Creates order and generates payment invoice for newly created order
 */
exports.createOrderInvoice = (req, res, next) => {
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
    var discountCodeApplied

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
          if (dbItem?.availableQty < item.quantity) {
            // This can be handled in different ways, but for simplicity, let's throw an error
            throw new Error(
              `Only ${dbItem.availableQty} units of ${dbItem.itemName} are left`,
            )
          }

          // Keep calculating total order value
          orderValueInPaiseBeforeDiscount += dbItem.priceInPaise * item.quantity

          return {
            itemId: item._id,
            quantity: item.quantity,
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
        if (existingDiscountCode) {
          return
        }
        /**
         Check if this order is eligible for discount, whether this is nth order
        */

        const currentOrderCount = existingOrdersCount + 1 // The current order being placed is existingOrdersCount + 1

        if (currentOrderCount % process.env.NTH_ORDER_COUNT == 0) {
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
      .then((newDiscountCode) => {
        // At this stage validate existing discount code (if exists)

        // If new discount code is generated, then there is nothing to validate
        if (newDiscountCode) {
          return newDiscountCode
        }

        if (!existingDiscountCode) {
          return
        }

        AdminController.validateDiscountCode(existingDiscountCode).then(
          (codeDetails) => {
            // Only accept this code if it is valid
            if (codeDetails.validCode) {
              discountPercent = codeDetails.discountPercent
              discountAmount =
                (discountPercent / 100) * orderValueInPaiseBeforeDiscount // Apply discount

              orderValueInPaiseAfterDiscount =
                orderValueInPaiseBeforeDiscount - discountAmount

              // Next stage is expecting discount code, so return the code
              return existingDiscountCode
            }
          },
        )
      })
      .then((discountCode) => {
        discountCodeApplied = discountCode
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

        const order = new Order({
          _id: orderId, // Use the orderId that was already created
          userId: new ObjectId(userId),
          status: OrderStatus.CREATED,
          createdOn: new Date(),
          itemsPurchased,
          orderValueInPaiseAfterDiscount,
          orderValueInPaiseBeforeDiscount,
          discountAmount,
          discountCode: discountCodeApplied
            ? new ObjectId(discountCodeApplied)
            : null,
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
          discountCodeApplied,
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
          orderValueInPaiseAfterDiscount: paisetoRupee(
            orderValueInPaiseAfterDiscount,
          ),
          orderValueInPaiseAfterDiscount: paisetoRupee(
            orderValueInPaiseAfterDiscount,
          ),
          discountAmount: paisetoRupee(discountAmount),
          itemsPurchased,
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

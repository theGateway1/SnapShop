const HttpStatus = require('http-status-codes')
const Item = require('../common/models/item')
const { paisetoRupee } = require('./common-controller')

/**
 * Middleware function to get products
 * @param {Number} req.params.page - To not retreive all the documents from database at once, pagination has been done, each page shows 10 results
 * @returns {Array} List of products
 */
exports.getProducts = (req, res, next) => {
  const page = req.params?.page ?? 1
  const resultsPerPage = 12
  const skipCount = resultsPerPage * page - resultsPerPage
  Item.find({
    availableQty: {
      $gte: 1,
    },
  })
    .skip(skipCount)
    .limit(resultsPerPage)
    .then((items) => {
      items = items?.map((item) => {
        return {
          name: item.itemName,
          price: paisetoRupee(item.priceInPaise),
          availableQty: item.availableQty,
          _id: item._id.toString(),
          imgSrc: item.imgSrc,
        }
      })
      res.status(HttpStatus.StatusCodes.OK).json(items)
    })
}

const HttpStatus = require('http-status-codes')
const Item = require('../common/models/item')

/**
 * Middleware function to get products
 * @param {Number} req.params.page - To not retreive all the documents from database at once, pagination has been done, each page shows 10 results
 * @returns {Array} List of products
 */
exports.getProducts = (req, res, next) => {
  const page = req.params?.page ?? 1
  const resultsPerPage = 10
  const skipCount = resultsPerPage * page - resultsPerPage
  Item.find()
    .skip(skipCount)
    .limit(resultsPerPage)
    .then((items) => {
      items = items?.map((item) => {
        return {
          name: item.itemName,
          price: Number((item.priceInPaise / 100).toFixed(2)),
          availableQty: item.availableQty,
          _id: item._id.toString(),
          imgSrc: item.imgSrc,
        }
      })
      res.status(HttpStatus.StatusCodes.OK).json(items)
    })
}

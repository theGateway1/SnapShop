exports.Results = {
  SUCCESS: 'Success',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  EXCEPTION: 'Exception',
  UNAUTHORIZED: 'Unauthorized',
}

exports.OrderStatus = {
  CREATED: 'created',
  PAID: 'paid',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
}

exports.DiscountCodeStatus = {
  ACTIVE: 'active', // Unused code that will avail discount
  USED: 'used', // Discount code that has been used
  REVOKED: 'revoked', // An active discount code that has been revoked by admin
}

// Common methods used by various controllers
exports.paisetoRupee = (priceInPaise) => {
  return Number((priceInPaise / 100).toFixed(2))
}

exports.formatPaisePrice = (priceInPaise) => {
  return Number(priceInPaise.toFixed(2))
}

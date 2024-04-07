const express = require('express')
const app = express()
const mongoose = require('mongoose')
const AdminRouter = require('./routes/admin-routes')
const OrderRouter = require('./routes/order')
const PaymentRouter = require('./routes/payment')
const AuthRouter = require('./routes/auth')
const ProductRouter = require('./routes/product')
app.use(express.json())

// Add CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authToken')
  next()
})

// App routes
app.get('/', (req, res, next) =>
  res.status(200).send('Hi, from The 4 PM Store'),
)
app.use('/admin', AdminRouter)
app.use('/auth', AuthRouter)
app.use('/order', OrderRouter)
app.use('/payment', PaymentRouter)
app.use('/product', ProductRouter)

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server listening on port ${port}`))

// Connect to database
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.UNIBLOX_MONGODB, {
      dbName: 'uniblox',
    })

    console.log('Connected to database')
  } catch (error) {
    console.error('Failed to connect to database', error)
  }
}

connectToDatabase()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const AdminRouter = require('./routes/admin-only')

// App routes
app.use('/admin', AdminRouter)

const port = process.env.PORT || 3000
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

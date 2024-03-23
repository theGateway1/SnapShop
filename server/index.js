const express = require('express')
const app = express()
const AdminRouter = require('./routes/admin-only')

// Specify routes
app.use('/admin', AdminRouter)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on port ${port}`))

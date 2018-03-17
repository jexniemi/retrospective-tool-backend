const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')


// Models:
const Example = require('./models/example')


// Controllers:
const examplesRouter = require('./controllers/examples')


mongoose
  .connect(config.mongoUrl)
  .then( () => {
    console.log('connected to database', config.mongoUrl)
  })
  .catch( err => {
    console.log(err)
  })

// app.use
app.use(cors())
app.use(bodyParser.json())

// app.use routes
app.use('/api/examples', examplesRouter)

const PORT = config.port
const server = http.createServer(app)
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}
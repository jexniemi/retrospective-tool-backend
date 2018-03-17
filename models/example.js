const mongoose = require('mongoose')

const exampleSchema = new mongoose.Schema({
  content: String
})

exampleSchema.statics.format = (example) => {
  return {
    content: example.content
  }
}

const Example = mongoose.model('Example', exampleSchema)

module.exports = Example
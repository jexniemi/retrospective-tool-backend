const examplesRouter = require('express').Router()
const Example = require('../models/example')

examplesRouter.get('/', async (request, response) => {
	const examples = await Example
		.find({})
	response.json(examples)
})

examplesRouter.post('/', async (request, response) => {
	try {
        const example = new Example(request.body)

        example
            .save()
            .then(result => {
                response.status(201).json(result)
            })
	} catch (exception) {
		console.log(exception)
	}
})


module.exports = examplesRouter

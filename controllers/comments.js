const commentsRouter = require('express').Router();
const Comment = require('../models/comment');

commentsRouter.get('/', async (request, response) => {
  const comments = await Comment
    .find({});
  response.json(comments);
});

commentsRouter.post('/', async (request, response) => {
  try {
    const content = request.body.content;

    if (!content) {
      return response.status(400).json({ error: 'Content is missing!' });
    }

    const project = request.body.project;
    if (!project) {
      return response.status(400).json({ error: 'Project is missing!' });
    }

    const comment = new Comment(content, project);
    const result = await comment.save();
    return response.status(201).json(result);
  } catch (exception) {
    console.log(exception);
  }
});

module.exports = commentsRouter;
const jwt = require('jsonwebtoken');
const commentsRouter = require('express').Router();
const Comment = require('../models/comment');
const Project = require('../models/project');

commentsRouter.get('/', async (request, response) => {
  const comments = await Comment
    .find({}).populate('project');
  response.json(comments);
});

commentsRouter.post('/', async (request, response) => {
  try {
    const { content, creator, token } = request.body;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.name) {
      return response.status(401).json({ error: 'Token missing or invalid' });
    }

    if (!content) {
      return response.status(400).json({ error: 'Content is missing!' });
    }

    const foundProject = await Project.findOne({ name: decodedToken.name });
    if (!foundProject) {
      return response.status(400).json({ error: 'No such project!' });
    }

    const comment = new Comment({ content, creator, project: foundProject._id });
    foundProject.comments = foundProject.comments.concat(comment._id);
    await foundProject.save();
    const result = await comment.save();
    return response.status(201).json(result);
  } catch (exception) {
    console.log('error: ', exception);    
    if (exception.name === 'JsonWebTokenError' ) {
      return response.status(401).json({ error: exception.message });
    }
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = commentsRouter;

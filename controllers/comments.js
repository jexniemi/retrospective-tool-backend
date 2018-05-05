const jwt = require('jsonwebtoken');
const commentsRouter = require('express').Router();
const Comment = require('../models/comment');
const Project = require('../models/project');
const mongoose = require('mongoose');
const moment = require('moment');

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

commentsRouter.put('/:id', async (request, response) => {
  try {
    const { token, important } = request.body;

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.name) {
      return response.status(401).json({ error: 'Token missing or invalid' });
    }

    const id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(422).json({ error: 'Id is not valid!' });
    }

    const foundComment = await Comment.findOne({ _id: id });
    if (!foundComment) {
      return response.status(400).json({ error: 'No such comment!' });
    }

    const commentsProject = await Project.findById(foundComment.project);
    if (commentsProject.name !== decodedToken.name) {
      return response.status(403).json({ error: 'No permission to access this project!' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(id, { important }, { new: true });
    response.status(200).json(updatedComment);
  } catch (exception) {
    console.log('error: ', exception);
    if (exception.name === 'JsonWebTokenError' ) {
      return response.status(401).json({ error: exception.message });
    }
    response.status(500).json({ error: 'Internal server error' });
  }
});

commentsRouter.delete('/:id', async (request, response) => {
  try {
    const { token } = request.body;

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.name) {
      return response.status(401).json({ error: 'Token missing or invalid' });
    }

    const id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(422).json({ error: 'Id is not valid!' });
    }

    const foundComment = await Comment.findOne({ _id: id });
    if (!foundComment) {
      return response.status(400).json({ error: 'No such comment!' });
    }

    const commentsProject = await Project.findById(foundComment.project);
    if (commentsProject.name !== decodedToken.name) {
      return response.status(403).json({ error: 'No permission to access this project!' });
    }

    const whenCreated = moment(moment().valueOf()).diff(moment(foundComment.time));
    const fourHours = moment.duration(4*60*60*1000).valueOf();
    const isFresh = fourHours - whenCreated > 0;
    if (isFresh) {
      return response.status(403).json({ error: 'Comment is too fresh to be deleted!' });
    }

    await Comment.findByIdAndRemove(id);
    return response.status(204).json({ message: 'Deletion success!' });
  } catch (exception) {
    console.log('error: ', exception);
    if (exception.name === 'JsonWebTokenError' ) {
      return response.status(401).json({ error: exception.message });
    }
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = commentsRouter;

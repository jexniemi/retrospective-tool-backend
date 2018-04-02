const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: String,
  creator: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

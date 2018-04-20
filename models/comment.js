const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: String,
  creator: String,
  time: { type: Date, default: Date.now },
  important: { type: Boolean, default: false },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

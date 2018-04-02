const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  password: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

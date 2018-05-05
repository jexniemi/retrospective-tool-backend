const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const config = require('./utils/config');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.body.token = authorization.substring(7);
  } else {
    req.body.token = null;
  }
  next();
});

// Routers
const projectsRouter = require('./controllers/projects');
app.use('/api/projects', projectsRouter);

const commentsRouter = require('./controllers/comments');
app.use('/api/comments', commentsRouter);

// Database connection
mongoose
  .connect(config.mongoUrl)
  .then(() => {
    console.log('connected to database', config.mongoUrl);
  })
  .catch(err => {
    console.log(err);
  });

// Initialize server
const PORT = config.port;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${config.port}`);
});

// Initialize socket.io for project page
const io = socketIo(server);
io.of('/api/projects').on('connection', socket => {
  const name = socket.handshake.query.name;
  socket.join(name);

  socket.on('add', (data) => {
    socket.to(name).broadcast.emit('add comment', data);
  });

  socket.on('update', (data) => {
    socket.to(name).broadcast.emit('update comment', data);
  });
});

server.on('close', () => {
  mongoose.connection.close();
});

module.exports = {
  app, server
};
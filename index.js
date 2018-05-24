const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const config = require('./utils/config');
const shortid = require('shortid');

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
  const username = socket.handshake.query.username;
  socket.join(name);

  const id = shortid.generate();
  socket.emit('set id', id);
  socket.to(name).broadcast.emit('joined', { id, username });

  socket.on('add', (data) => {
    socket.to(name).broadcast.emit('add comment', data);
  });

  socket.on('update', (data) => {
    socket.to(name).broadcast.emit('update comment', data);
  });

  socket.on('remove', (data) => {
    socket.to(name).broadcast.emit('remove comment', data);
  });

  socket.on('introduce', (data) => {
    socket.to(name).broadcast.emit('introduce', data);
  });

  socket.on('disconnect', () => {
    socket.to(name).broadcast.emit('disconnected', id);
  });

  socket.on('voted', (data) => {
    socket.to(name).broadcast.emit('voted', data);
  });

  socket.on('show votes', () => {
    socket.emit('show votes');
    socket.to(name).emit('show votes');
  });

  socket.on('my vote', (data) => {
    socket.to(name).broadcast.emit('my vote', data);
  });

  socket.on('clear votes', () => {
    socket.to(name).broadcast.emit('clear votes');
  });

  socket.on('init game', (data) => {
    socket.to(name).emit('current game state', data.currentState);
  });

  socket.on('set poker title', (title) => {
    socket.to(name).broadcast.emit('set poker title', title);
  });
});

server.on('close', () => {
  mongoose.connection.close();
});

module.exports = {
  app, server
};
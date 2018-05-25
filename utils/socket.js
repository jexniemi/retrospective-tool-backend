const shortid = require('shortid');

const initSocket = (io) => {
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
};

module.exports = initSocket;

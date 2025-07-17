const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const cors=require('cors')
const PORT = 5000;

app.use(express.static(path.join(__dirname, '../client/build')));

io.on('connection', socket => {
  console.log('New user connected:', socket.id);

  socket.on('join', roomId => {
    socket.join(roomId);
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    if (clients.length > 1) {
      socket.to(roomId).emit('user-joined', socket.id);
    }

    socket.on('signal', payload => {
      io.to(payload.to).emit('signal', {
        from: socket.id,
        data: payload.data,
      });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-left', socket.id);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});

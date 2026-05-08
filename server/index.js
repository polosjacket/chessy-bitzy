/**
 * server/index.js
 * Express + Socket.io server for 2-player online sessions.
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  cors: { origin: 'http://localhost:5173' },
});

const PORT = 3000;

// ─── Simple Room Management ───────────────────────────────
const rooms = {}; // roomId → { players: [], fen: '' }

io.on('connection', (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);

  socket.on('joinRoom', ({ roomId }) => {
    if (!rooms[roomId]) rooms[roomId] = { players: [], fen: null };
    const room = rooms[roomId];

    if (room.players.length >= 2) {
      socket.emit('roomFull');
      return;
    }

    room.players.push(socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.color  = room.players.length === 1 ? 'w' : 'b';
    socket.emit('assignColor', { color: socket.data.color });
    io.to(roomId).emit('playerCount', { count: room.players.length });
    console.log(`[Room ${roomId}] Player joined as ${socket.data.color}`);
  });

  socket.on('move', ({ from, to, promotion, fen }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    rooms[roomId].fen = fen;
    socket.to(roomId).emit('opponentMove', { from, to, promotion, fen });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
      io.to(roomId).emit('playerCount', { count: rooms[roomId].players.length });
      if (rooms[roomId].players.length === 0) delete rooms[roomId];
    }
    console.log(`[-] Player disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🍄 Chessy Bitzy server running at http://localhost:${PORT}`);
});

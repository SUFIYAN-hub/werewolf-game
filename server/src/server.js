const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleSocketConnection } = require('./socketHandlers');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"]
//   }
// });
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Will set this later
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active game rooms
global.gameRooms = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', rooms: gameRooms.size });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  handleSocketConnection(socket, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
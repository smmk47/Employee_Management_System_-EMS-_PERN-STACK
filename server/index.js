const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/knex'); // Initialize database connection
const http = require('http');
const { ChatMessage } = require('./models/chatMessage');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', // React app's address
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount user routes
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

// Mount meeting routes
const meetingRoutes = require('./routes/meetingRoutes');
app.use('/api/meetings', meetingRoutes);

// Start RabbitMQ consumer for meeting requests
const { startMeetingConsumer } = require('./controllers/meetingController');
startMeetingConsumer().catch(console.error);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  // Join a meeting chat room
  socket.on('joinMeeting', ({ meetingId }) => {
    socket.join(`meeting_${meetingId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', async ({ meetingId, senderId, message }) => {
    const chatMsg = await ChatMessage.query().insert({
      meeting_id: meetingId,
      sender_id: senderId,
      message
    });
    io.to(`meeting_${meetingId}`).emit('receiveMessage', {
      id: chatMsg.id,
      meeting_id: chatMsg.meeting_id,
      sender_id: chatMsg.sender_id,
      message: chatMsg.message,
      sent_at: chatMsg.sent_at
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

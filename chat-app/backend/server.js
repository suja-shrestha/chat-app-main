// ── 1. Imports ─────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('./models/Message');
const authRoutes = require('./routes/auth');

// ── 2. Create App FIRST ────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ── 3. Middlewares ─────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: '*' }));

// ── 4. Routes (AFTER app and middlewares) ──────────────────────
app.use('/auth', authRoutes);

// ── 5. Connect to MongoDB ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB ✅');
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error);
  });

// ── 6. REST API Routes ─────────────────────────────────────────

// GET /messages — fetch last 50 messages from database
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// DELETE /messages/:id
app.delete('/messages/:id', async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// ── 7. Socket.io ───────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle new message
  socket.on('sendMessage', async (data) => {
    try {
      const newMessage = new Message({
        username: data.username,
        text: data.text,
        room: data.room || 'general',
      });
      await newMessage.save();
      io.emit('receiveMessage', newMessage);
    } catch (error) {
      console.log('Error saving message:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ── 8. Start Server ────────────────────────────────────────────
server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
// ── 1. Imports ─────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
// Import auth routes
const authRoutes = require('./routes/auth');

// Use auth routes — all routes start with /auth
// So register = POST /auth/register
// And login   = POST /auth/login
app.use('/auth', authRoutes);

// mongoose lets us talk to MongoDB
const mongoose = require('mongoose');

// dotenv loads our .env file so we can use process.env.MONGO_URI
require('dotenv').config();

// Import our Message model (the blueprint)
const Message = require('./models/Message');

// ── 2. Setup ───────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// ── 3. Middlewares ─────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ── 4. Connect to MongoDB ──────────────────────────────────────
// mongoose.connect() opens a connection to our database
// process.env.MONGO_URI reads from our .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // .then() runs when connection is SUCCESSFUL
    console.log('Connected to MongoDB ✅');
  })
  .catch((error) => {
    // .catch() runs if connection FAILS
    console.log('MongoDB connection error:', error);
  });

// ── 5. REST API Routes ─────────────────────────────────────────

// GET /messages — fetch last 50 messages from database
app.get('/messages', async (req, res) => {
  // async means this function can use await
  // await pauses until the database responds

  try {
    // Message.find() → get ALL messages from database
    // .sort({ createdAt: 1 }) → oldest first (1 = ascending)
    // .limit(50) → only get last 50 messages
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .limit(50);

    // Send them to React
    res.json(messages);
  } catch (error) {
    // If something goes wrong with database
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// DELETE /messages/:id
app.delete('/messages/:id', async (req, res) => {
  try {
    // findByIdAndDelete finds the message by MongoDB's _id
    // and deletes it in one step
    const deleted = await Message.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// ── 6. Socket.io ───────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle new message
  socket.on('sendMessage', async (data) => {
    try {
      // Create a new Message document and save to MongoDB
      // new Message({...}) creates the document
      // .save() writes it to the database
      const newMessage = new Message({
        username: data.username,
        text: data.text,
        room: data.room || 'general',
      });

      // await pauses here until MongoDB confirms it's saved
      await newMessage.save();

      // Broadcast to ALL users
      // newMessage now has _id and createdAt from MongoDB
      io.emit('receiveMessage', newMessage);

    } catch (error) {
      console.log('Error saving message:', error);
    }
  });

  // Typing indicator — same as before
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  // Disconnect — same as before
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ── 7. Start Server ────────────────────────────────────────────
server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
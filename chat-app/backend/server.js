// ── 1. Import Express ──────────────────────────────────────────
const express = require('express');

// ── 2. Import CORS ─────────────────────────────────────────────
// CORS = Cross Origin Resource Sharing
// By default, browsers BLOCK requests between different ports
// Our React app runs on port 3000, backend on port 5000
// Without CORS, React cannot talk to Express — so we enable it
const cors = require('cors')

//create app instance
//express() returns application object that we can use to define routes and middleware like get(), post(), listen() etc.
const app = express();

// Define the port number for the server to listen on
const PORT = 5000;

// ── 3. Middlewares ─────────────────────────────────────────────
// Middleware = functions that run on EVERY request before your routes
// They process the request and pass it forward

// This tells Express to accept JSON data in request bodies
// Without this, req.body will be undefined when React sends data
app.use(express.json());

// This enables CORS so React (port 3000) can talk to Express (port 5000)
app.use(cors());

// ── 4. Temporary Database ──────────────────────────────────────
// We'll use a simple array for now to store messages
// Later we'll replace this with a real MongoDB database
let messages = [
  { id: 1, username: 'Alice', text: 'Hey everyone!', time: '10:00 AM' },
  { id: 2, username: 'Bob',   text: 'Hello Alice!',  time: '10:01 AM' },
];

// ── 5. Routes ──────────────────────────────────────────────────

// GET /messages — fetch all messages
// React will call this to load the chat history
app.get('/messages', (req, res) => {
  // res.json() sends data back as JSON format
  // JSON is how frontend and backend exchange data
  res.json(messages);
});

// POST /messages — send a new message
// React will call this when user hits the Send button
app.post('/messages', (req, res) => {
  // req.body contains the data React sent us
  // Example: { username: 'Charlie', text: 'Hi there!' }
  const { username, text } = req.body;

  // Basic validation — make sure data actually exists
  if (!username || !text) {
    // 400 = Bad Request (user sent incomplete data)
    return res.status(400).json({ error: 'Username and text are required' });
  }

  // Create a new message object
  const newMessage = {
    id: messages.length + 1,       // Simple ID for now
    username: username,
    text: text,
    time: new Date().toLocaleTimeString(), // Current time
  };

  // Add it to our temporary array
  messages.push(newMessage);

  // 201 = Created (something new was successfully created)
  res.status(201).json(newMessage);
});

// DELETE /messages/:id — delete a specific message
// The :id is a URL parameter — it's dynamic
// Example: DELETE /messages/2 will delete message with id 2
app.delete('/messages/:id', (req, res) => {
  // req.params.id gives us the id from the URL
  // We convert it to a Number because URL params are always strings
  const id = Number(req.params.id);

  // Find the index of the message with this id
  const index = messages.findIndex((msg) => msg.id === id);

  // Example - trying to delete id 99 which doesn't exist:
//index = -1  // nothing found!
// We send back 404 Not Found 
// Our case - id 2 was found:
//index = 1   // found at position 1!
// We skip this if block and continue 
  if (index === -1) {
    // 404 = Not Found
    return res.status(404).json({ error: 'Message not found' });
  }

  // Remove the message from the array
  // splice(index position of data, 1 item) removes 1 item at the given index
  messages.splice(index, 1);

  res.json({ success: 'Message deleted' });
});

// ── 6. Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
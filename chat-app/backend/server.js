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
app.use(express.json()); // Middleware to parse JSON bodies

// This enables CORS so React (port 3000) can talk to Express (port 5000)
app.use(cors()); // Middleware to enable CORS (Cross-Origin Resource Sharing)   

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
app.get('/messages',(req,res)=>{
    // res.json() sends data back as JSON format
  // JSON is how frontend and backend exchange data
    res.json(messages);
});

app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`)
});


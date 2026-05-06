// A Model tells MongoDB what our data looks like
// Like a blueprint for every message we save

const mongoose = require('mongoose');

// Schema = the structure/shape of our data
// Every message MUST have these fields
const messageSchema = new mongoose.Schema(
  {
    // username field
    username: {
      type: String,      // must be text
      required: true,    // cannot be empty
      trim: true,        // removes extra spaces automatically
    },

    // text field
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // room field — for multiple chat rooms later
    room: {
      type: String,
      default: 'general', // if not specified, goes to general room
    },
  },
  {
    // timestamps: true automatically adds:
    // createdAt → when message was created
    // updatedAt → when message was last edited
    // We don't need to add time manually anymore!
    timestamps: true,
  }
);

// Create the Model from the Schema
// 'Message' → MongoDB will create a collection called 'messages'
// (automatically lowercased and pluralized)
const Message = mongoose.model('Message', messageSchema);

// Export so server.js can use it
module.exports = Message;
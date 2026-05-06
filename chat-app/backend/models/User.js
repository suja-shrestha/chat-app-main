const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },

  // Reset token — generated when user requests password reset
  resetToken: {
    type: String,
    default: null,
  },

  // Token expiry — reset link expires after 1 hour
  resetTokenExpiry: {
    type: Date,
    default: null,
  },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
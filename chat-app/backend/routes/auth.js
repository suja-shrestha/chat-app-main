const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ── REGISTER ──────────────────────────────────────────────────
// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Encrypt password before saving
    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 means encrypt 10 times (more = safer but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with encrypted password
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // never save plain password!
    });

    await newUser.save();

    // Create JWT token
    // jwt.sign(payload, secret, options)
    // payload = data to store in token
    // secret = our JWT_SECRET from .env
    // expiresIn = token expires after 7 days
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token and user info back to React
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    // Compare entered password with encrypted password
    // bcrypt.compare() returns true if they match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// crypto is built into Node.js — no installation needed
// we use it to generate a random reset token

// ── FORGOT PASSWORD ───────────────────────────────────────────
// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // IMPORTANT: Even if email not found, we send success
    // This prevents hackers from knowing which emails exist
    if (!user) {
      return res.json({
        success: 'If this email exists, a reset link has been sent'
      });
    }

    // Generate a random reset token
    // crypto.randomBytes(32) = 32 random bytes
    // .toString('hex') = convert to readable string
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save token and expiry to user in database
    // Date.now() = current time in milliseconds
    // + 3600000 = add 1 hour (3600 seconds × 1000ms)
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    // Create the reset link
    // This is the URL user clicks in their email
    const resetLink = `http://localhost:5174/reset-password?token=${resetToken}&email=${email}`;

    // Set up email sender using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ChatApp — Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #534AB7;">Reset Your Password 🔐</h2>
          <p>You requested a password reset for your ChatApp account.</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background: #534AB7; 
                    color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 13px;">
            If you didn't request this, ignore this email. Your password won't change.
          </p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ success: 'If this email exists, a reset link has been sent' });

  } catch (error) {
    console.log('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// ── RESET PASSWORD ────────────────────────────────────────────
// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user with matching email AND token
    const user = await User.findOne({ email, resetToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid reset link' });
    }

    // Check if token has expired
    // Date.now() = current time
    // user.resetTokenExpiry = expiry time we set earlier
    if (Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one' });
    }

    // Encrypt new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;        // clear token so link cant be reused
    user.resetTokenExpiry = null;  // clear expiry
    await user.save();

    res.json({ success: 'Password reset successfully! You can now login.' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;

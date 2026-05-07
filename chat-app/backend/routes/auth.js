// ── ALL IMPORTS AT THE TOP ─────────────────────────────────────
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
// ── REGISTER ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// ── LOGIN ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

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

// ── FORGOT PASSWORD ────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: 'If this email exists, a reset link has been sent'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ChatApp — Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #534AB7;">Reset Your Password 🔐</h2>
          <p>You requested a password reset for your ChatApp account.</p>
          <p>Click the button below to reset your password. 
             This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; 
                    background: #534AB7; color: white; 
                    text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 13px;">
            If you didn't request this, ignore this email. 
            Your password won't change.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: 'If this email exists, a reset link has been sent' });

  } catch (error) {
    console.log('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// ── RESET PASSWORD ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email, resetToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid reset link' });
    }

    if (Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ success: 'Password reset successfully! You can now login.' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ── VERIFY TOKEN MIDDLEWARE ────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ── UPDATE PROFILE ─────────────────────────────────────────────
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { username, photo } = req.body;

    if (!username.trim()) {
      return res.status(400).json({ error: 'Username cannot be empty' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { username, photo },
      { new: true }
    );

    res.json({
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        photo: updatedUser.photo,
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── CHANGE PASSWORD ────────────────────────────────────────────
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ── UPLOAD PROFILE PHOTO ───────────────────────────────────────
router.post('/upload-photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // req.file.path = permanent Cloudinary URL
    const photoUrl = req.file.path;

    // Save URL to user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { photo: photoUrl },
      { new: true }
    );

    res.json({
      photoUrl,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        photo: updatedUser.photo,
      }
    });

  } catch (error) {
    console.log('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

module.exports = router;
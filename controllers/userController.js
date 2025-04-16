import User from '../models/user.js';
import { sendEmail } from '../services/mailer.js';
import { createToken, verifyToken } from '../services/token.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// This controller handles user registration, email verification, and login
export const registerUser = async (req, res) => {
  // Changed return type to be more specific
  try {
    const { username, email, password } = req.body;
    // Validate input
    if (!username || !email || !password) {
      res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
      return;
    }
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'Username or email already exists' });
      return;
    }
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      isVerified: false,
    });
    await newUser.save();
    // Create verification token
    const tokenResult = await createToken(
      { _id: newUser._id.toString() },
      'verifyEmail',
      24
    );
    if (!tokenResult.status || !tokenResult.data) {
      await User.deleteOne({ _id: newUser._id });
      res
        .status(500)
        .json({ message: 'Failed to generate verification token' });
      return;
    }
    // Send verification email
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify/${tokenResult.data}`;
    const emailSent = await sendEmail(
      email,
      'Verify Your Email Address',
      'verifyEmail',
      { username, verificationUrl, email }
    );
    if (!emailSent) {
      await User.deleteOne({ _id: newUser._id });
      res.status(500).json({ message: 'Failed to send verification email' });
      return;
    }
    res.status(201).json({
      message:
        'User registered successfully. Please check your email for verification.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error); // Added logging
    res.status(500).json({
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;
    if (!token || !email) {
      res.status(400).json({ message: 'Token and email are required' });
      return;
    }
    const verificationResult = await verifyToken(token, email, 'verifyEmail');
    if (!verificationResult.status) {
      res.status(400).json({ message: verificationResult.message });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    // Update isVerified field (requires schema update)
    user.set('isVerified', true);
    await user.save();
    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified || true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error verifying email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username && !email) {
      res.status(400).json({ message: 'Username or email is required' });
      return;
    }
    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }
    // Find user by username or email
    const query = [];
    if (email) query.push({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (username)
      query.push({ username: { $regex: `^${username}$`, $options: 'i' } });
    const user = await User.findOne({ $or: query });
    if (!user) {
      res.status(401).json({ message: 'Invalid username/email or password' });
      return;
    }
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid username/email or password' });
      return;
    }
    // Check if user is verified
    if (!user.isVerified) {
      res.status(401).json({
        message:
          'Email not verified. Please check your email for verification.',
      });
      return;
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default-secret', // Fallback for dev; ensure JWT_SECRET is set
      { expiresIn: '1h' }
    );
    // Create access and refresh tokens
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

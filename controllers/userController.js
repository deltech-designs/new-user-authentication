import User from '../models/user.js';
import { sendEmail } from '../services/mailer.js';
import { createToken, verifyToken } from '../services/token.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }

    const newUser = new User({
      username,
      email,
      password,
      isVerified: false,
    });

    await newUser.save();

    const tokenResult = await createToken(
      { _id: newUser._id.toString() },
      'verifyEmail',
      24
    );

    if (!tokenResult.status || !tokenResult.data) {
      await User.deleteOne({ _id: newUser._id });
      return res
        .status(500)
        .json({ message: 'Failed to generate verification token' });
    }

    const verificationUrl = `${process.env.APP_URL}/api/auth/verify/${tokenResult.data}?email=${email}`;

    const emailSent = await sendEmail(
      email,
      'Verify Your Email Address',
      'verifyEmail',
      { username, email, tokenResult }
    );

    if (!emailSent) {
      await User.deleteOne({ _id: newUser._id });
      return res
        .status(500)
        .json({ message: 'Failed to send verification email' });
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
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message || 'Unknown error',
    });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email are required' });
    }

    const verificationResult = await verifyToken(token, email, 'verifyEmail');
    if (!verificationResult.status) {
      return res.status(400).json({ message: verificationResult.message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error verifying email',
      error: error.message || 'Unknown error',
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: 'Username or email is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const query = [];
    if (email) query.push({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (username)
      query.push({ username: { $regex: `^${username}$`, $options: 'i' } });

    const user = await User.findOne({ $or: query });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: 'Invalid username/email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message:
          'Email not verified. Please check your email for verification.',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in user',
      error: error.message || 'Unknown error',
    });
  }
};

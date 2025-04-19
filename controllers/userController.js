import User from '../models/user.js';
import { sendEmail } from '../services/mailer.js';
import { createToken, verifyToken } from '../services/token.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Fullname, email, and password are required' });
    }

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({
      fullname,
      email: emailLower,
      password,
      isVerified: false,
    });

    await newUser.save();

    const tokenResult = await createToken(newUser, 'verifyEmail', 24);
    if (!tokenResult.status || !tokenResult.data) {
      await User.deleteOne({ _id: newUser._id });
      return res
        .status(500)
        .json({ message: 'Failed to generate verification token' });
    }

    const verificationUrl = `${process.env.APP_URL}/verify-email/${
      tokenResult.data
    }?email=${encodeURIComponent(emailLower)}`;

    const emailSent = await sendEmail(
      emailLower,
      'Verify Your Email Address',
      'verifyEmail',
      {
        fullname,
        verificationUrl,
        email: emailLower,
        verificationCode: tokenResult.data,
        expirationTime: '1440',
      }
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
        fullname: newUser.fullname,
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

    const verificationResult = await verifyToken(
      token,
      email.toLowerCase(),
      'verifyEmail'
    );
    if (!verificationResult.status) {
      return res.status(400).json({ message: verificationResult.message });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    // Update user verification status
    user.isVerified = true;
    await user.save();
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      message: 'Error verifying email',
      error: error.message || 'Unknown error',
    });
  }
};

// RESEND VERIFICATION EMAIL
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const tokenResult = await createToken(user, 'verifyEmail', 24);
    if (!tokenResult.status || !tokenResult.data) {
      return res
        .status(500)
        .json({ message: 'Failed to generate verification token' });
    }

    const verificationUrl = `${process.env.APP_URL}/verify-email/${
      tokenResult.data
    }?email=${encodeURIComponent(emailLower)}`;

    const emailSent = await sendEmail(
      emailLower,
      'Verify Your Email Address',
      'verifyEmail',
      {
        fullname: user.fullname,
        verificationUrl,
        email: emailLower,
        verificationCode: tokenResult.data,
        expirationTime: '1440',
      }
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ message: 'Failed to send verification email' });
    }

    res.status(200).json({
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      message: 'Error resending verification email',
      error: error.message || 'Unknown error',
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower }).select('+password');
    // console.log('User found:', user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // const isPasswordValid = await user.comparePassword(password);
    const isPasswordValid = await user.comparePassword(password);
    // console.log('✅ Valid Password?', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message:
          'Email not verified. Please check your email or resend verification.',
        action: 'resend_verification',
        email: user.email,
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: 'Error logging in user',
      error: error.message || 'Unknown error',
    });
  }
};

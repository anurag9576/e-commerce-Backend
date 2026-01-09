const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with OTP
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password,
      emailOTP: otp,
      emailOTPExpires: otpExpires
    });

    // Send OTP email
    console.log('Attempting to send OTP email...');
    const emailSent = await sendOTPEmail(email, otp);
    console.log('Email send result:', emailSent);
    
    if (!emailSent) {
      // If email fails, delete the user and return error
      console.log('Email failed, deleting user...');
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP verification.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    console.log('Login attempt for email:', email);
    console.log('User found:', !!user);
    console.log('Stored password:', user.password);
    console.log('Password is hashed:', user.password.startsWith('$2'));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for OTP.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get User Profile (protected route)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    if (!user.emailOTP || !user.emailOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.'
      });
    }

    if (Date.now() > user.emailOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (user.emailOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpires = null;
    await user.save();

    // Generate token for auto-login after verification
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.emailOTP = otp;
    user.emailOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your email.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  verifyOTP,
  resendOTP
};

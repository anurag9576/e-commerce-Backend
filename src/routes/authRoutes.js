const express = require('express');
const { register, login, getProfile, verifyOTP, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected)
router.get('/profile', protect, getProfile);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Resend OTP
router.post('/resend-otp', resendOTP);

// Send OTP (alias for resend-otp)
router.post('/send-otp', resendOTP);

module.exports = router;

const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected)
router.get('/profile', protect, getProfile);

module.exports = router;

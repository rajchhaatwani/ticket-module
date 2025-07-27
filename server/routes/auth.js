const express = require('express');
const jwt = require('jsonwebtoken');
const Organizer = require('../models/Organizer');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register organizer
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if organizer already exists
    const existingOrganizer = await Organizer.findOne({ email });
    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: 'Organizer already exists with this email'
      });
    }

    // Create organizer
    const organizer = await Organizer.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(organizer._id);

    res.status(201).json({
      success: true,
      message: 'Organizer registered successfully',
      data: {
        organizer,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login organizer
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find organizer and include password
    const organizer = await Organizer.findOne({ email }).select('+password');
    if (!organizer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await organizer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(organizer._id);

    // Remove password from response
    organizer.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        organizer,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current organizer profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        organizer: req.organizer
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new homeowner
// @access  Public
router.post('/register', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('firstName', 'First name is required').not().isEmpty(),
  body('lastName', 'Last name is required').not().isEmpty(),
  body('phone', 'Phone number is required').not().isEmpty(),
  body('address', 'Address is required').not().isEmpty(),
  body('city', 'City is required').not().isEmpty(),
  body('postcode', 'Postcode is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName, phone, address, city, postcode } = req.body;

  try {
    // Check if user already exists
    const userExists = await req.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await req.db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, postcode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [email, passwordHash, firstName, lastName, phone, address, city, postcode]
    );

    // Create JWT token
    const payload = {
      user: {
        id: newUser.rows[0].id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email);
    
    // Check if user exists
    const user = await req.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('User query result:', user.rows.length, 'rows found');

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.rows[0].id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/user
// @desc    Get user profile
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // Get user from token
    const user = await req.db.query(
      'SELECT id, email, first_name, last_name, phone, address, city, postcode, profile_image, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user has a tradesperson profile
    const tradesperson = await req.db.query(
      'SELECT id FROM tradespeople WHERE user_id = $1',
      [req.user.id]
    );

    const userData = user.rows[0];
    
    // Add tradesperson_id if user has a tradesperson profile
    if (tradesperson.rows.length > 0) {
      userData.tradesperson_id = tradesperson.rows[0].id;
    }

    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

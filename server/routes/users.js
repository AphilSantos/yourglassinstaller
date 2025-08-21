const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
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

  const {
    firstName,
    lastName,
    phone,
    address,
    city,
    postcode,
    profileImage
  } = req.body;

  try {
    const updatedUser = await req.db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, address = $4, city = $5, postcode = $6, profile_image = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING id, email, first_name, last_name, phone, address, city, postcode, profile_image, created_at`,
      [firstName, lastName, phone, address, city, postcode, profileImage, req.user.id]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await req.db.query(
      'SELECT id, first_name, last_name, city, profile_image, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await req.db.query(
      'SELECT * FROM categories ORDER BY name'
    );
    res.json(categories.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await req.db.query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    res.json(category.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

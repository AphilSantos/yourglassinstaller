const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job post
// @access  Private
router.post('/', auth, [
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('categoryId', 'Category is required').isInt(),
  body('location', 'Location is required').not().isEmpty(),
  body('budgetMin', 'Minimum budget is required').isFloat({ min: 0 }),
  body('budgetMax', 'Maximum budget is required').isFloat({ min: 0 }),
  body('timeline', 'Timeline is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    categoryId,
    location,
    budgetMin,
    budgetMax,
    timeline,
    images = []
  } = req.body;

  try {
    // Create job post
    const newJob = await req.db.query(
      `INSERT INTO jobs (user_id, category_id, title, description, location, budget_min, budget_max, timeline, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.id, categoryId, title, description, location, budgetMin, budgetMax, timeline, images]
    );

    res.json(newJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs
// @desc    Get all job posts with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, location, status = 'open', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT j.*, u.first_name, u.last_name, c.name as category_name
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      JOIN categories c ON j.category_id = c.id
      WHERE j.status = $1
    `;
    let queryParams = [status];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND j.category_id = $${paramCount}`;
      queryParams.push(category);
    }

    if (location) {
      paramCount++;
      query += ` AND j.location ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
    }

    query += ` ORDER BY j.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const jobs = await req.db.query(query, queryParams);
    res.json(jobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await req.db.query(
      `SELECT j.*, u.first_name, u.last_name, c.name as category_name
       FROM jobs j
       JOIN users u ON j.user_id = u.id
       JOIN categories c ON j.category_id = c.id
       WHERE j.id = $1`,
      [req.params.id]
    );

    if (job.rows.length === 0) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    res.json(job.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if job exists and belongs to user
    const job = await req.db.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (job.rows.length === 0) {
      return res.status(404).json({ msg: 'Job not found or unauthorized' });
    }

    const {
      title,
      description,
      categoryId,
      location,
      budgetMin,
      budgetMax,
      timeline,
      images,
      status
    } = req.body;

    const updatedJob = await req.db.query(
      `UPDATE jobs 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           location = COALESCE($4, location),
           budget_min = COALESCE($5, budget_min),
           budget_max = COALESCE($6, budget_max),
           timeline = COALESCE($7, timeline),
           images = COALESCE($8, images),
           status = COALESCE($9, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [title, description, categoryId, location, budgetMin, budgetMax, timeline, images, status, req.params.id]
    );

    res.json(updatedJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if job exists and belongs to user
    const job = await req.db.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (job.rows.length === 0) {
      return res.status(404).json({ msg: 'Job not found or unauthorized' });
    }

    await req.db.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/user/:userId
// @desc    Get all jobs by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const jobs = await req.db.query(
      `SELECT j.*, c.name as category_name
       FROM jobs j
       JOIN categories c ON j.category_id = c.id
       WHERE j.user_id = $1
       ORDER BY j.created_at DESC`,
      [req.params.userId]
    );

    res.json(jobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

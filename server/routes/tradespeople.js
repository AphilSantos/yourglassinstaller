const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const { User, Tradesperson } = require('../models/User');

// @route   POST /api/tradespeople/register
// @desc    Register as a tradesperson
// @access  Private
router.post('/register', [
  auth,
  body('businessName', 'Business name is required').not().isEmpty(),
  body('yearsExperience', 'Years of experience must be a number').isNumeric(),
  body('hourlyRate', 'Hourly rate must be a number').optional().isNumeric(),
  body('serviceCities', 'Service cities must be an array').optional().isArray(),
  body('servicePostcodes', 'Service postcodes must be an array').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tradesperson = new Tradesperson(req.db);
    
    // Check if user already has a tradesperson profile
    const existing = await tradesperson.findByUserId(req.user.id);
    if (existing) {
      return res.status(400).json({ msg: 'Tradesperson profile already exists' });
    }

    const tradespersonData = {
      userId: req.user.id,
      ...req.body
    };

    const newTradesperson = await tradesperson.create(tradespersonData);
    
    // Mock verification (since it's for demo)
    await tradesperson.mockVerifyIdentity(newTradesperson.id);
    await tradesperson.mockVerifyQualifications(newTradesperson.id);
    await tradesperson.mockVerifyInsurance(newTradesperson.id);
    await tradesperson.mockVerifyDBS(newTradesperson.id);
    await tradesperson.mockVerifyFinancial(newTradesperson.id);
    await tradesperson.updateOverallVerification(newTradesperson.id);

    const updatedTradesperson = await tradesperson.findById(newTradesperson.id);
    res.json(updatedTradesperson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tradespeople/:id/applications
// @desc    Get applications by tradesperson
// @access  Private
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findByUserId(req.user.id);
    
    if (!profile || profile.id !== parseInt(req.params.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const applicationsQuery = `
      SELECT a.*, j.title as job_title, j.description as job_description,
             j.location, j.budget_min, j.budget_max, j.timeline,
             u.first_name, u.last_name, u.phone, u.email
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.user_id = u.id
      WHERE a.tradesperson_id = $1
      ORDER BY a.created_at DESC
    `;

    const result = await req.db.query(applicationsQuery, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tradespeople/profile
// @desc    Get tradesperson profile by user ID
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findByUserId(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ msg: 'Tradesperson profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/tradespeople/profile
// @desc    Update tradesperson profile
// @access  Private
router.put('/profile', [
  auth,
  body('hourlyRate', 'Hourly rate must be a number').optional().isNumeric(),
  body('calloutFee', 'Callout fee must be a number').optional().isNumeric(),
  body('yearsExperience', 'Years of experience must be a number').optional().isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tradesperson = new Tradesperson(req.db);
    const existing = await tradesperson.findByUserId(req.user.id);
    
    if (!existing) {
      return res.status(404).json({ msg: 'Tradesperson profile not found' });
    }

    const updatedProfile = await tradesperson.updateProfile(existing.id, req.body);
    res.json(updatedProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tradespeople/search
// @desc    Search for tradespeople
// @access  Public
router.get('/search', [
  query('city', 'City must be a string').optional().isString(),
  query('postcode', 'Postcode must be a string').optional().isString(),
  query('minRating', 'Minimum rating must be a number').optional().isNumeric(),
  query('maxHourlyRate', 'Maximum hourly rate must be a number').optional().isNumeric(),
  query('verified', 'Verified must be a boolean').optional().isBoolean(),
  query('emergencyServices', 'Emergency services must be a boolean').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tradesperson = new Tradesperson(req.db);
    const searchCriteria = {
      city: req.query.city,
      postcode: req.query.postcode,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : null,
      maxHourlyRate: req.query.maxHourlyRate ? parseFloat(req.query.maxHourlyRate) : null,
      verified: req.query.verified === 'true',
      emergencyServices: req.query.emergencyServices === 'true',
      specialization: req.query.specialization
    };

    const results = await tradesperson.search(searchCriteria);
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tradespeople/featured
// @desc    Get featured tradespeople
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const tradesperson = new Tradesperson(req.db);
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const featured = await tradesperson.getFeatured(limit);
    res.json(featured);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tradespeople/:id
// @desc    Get tradesperson by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ msg: 'Tradesperson not found' });
    }

    // Get portfolio and reviews
    const portfolio = await tradesperson.getPortfolio(req.params.id);
    const reviews = await tradesperson.getReviews(req.params.id, 5);

    res.json({
      ...profile,
      portfolio,
      reviews
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tradespeople/:id/portfolio
// @desc    Add portfolio item
// @access  Private
router.post('/:id/portfolio', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('projectType', 'Project type is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findByUserId(req.user.id);
    
    if (!profile || profile.id !== parseInt(req.params.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const portfolioQuery = `
      INSERT INTO tradesperson_portfolio (
        tradesperson_id, title, description, project_type, before_image, 
        after_image, additional_images, project_value, completion_date, customer_testimonial
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const {
      title, description, projectType, beforeImage, afterImage,
      additionalImages = [], projectValue, completionDate, customerTestimonial
    } = req.body;

    const values = [
      req.params.id, title, description, projectType, beforeImage,
      afterImage, additionalImages, projectValue, completionDate, customerTestimonial
    ];

    const result = await req.db.query(portfolioQuery, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tradespeople/:id/quote
// @desc    Create a quote for a job
// @access  Private
router.post('/:id/quote', [
  auth,
  body('jobId', 'Job ID is required').not().isEmpty(),
  body('quoteAmount', 'Quote amount is required').isNumeric(),
  body('estimatedDurationHours', 'Estimated duration is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findByUserId(req.user.id);
    
    if (!profile || profile.id !== parseInt(req.params.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      jobId, quoteAmount, breakdown, validUntil, termsConditions,
      includesMaterials, estimatedDurationHours, startDateEstimate
    } = req.body;

    const quoteQuery = `
      INSERT INTO tradesperson_quotes (
        tradesperson_id, job_id, quote_amount, breakdown, valid_until,
        terms_conditions, includes_materials, estimated_duration_hours, start_date_estimate
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      req.params.id, jobId, quoteAmount, breakdown, validUntil,
      termsConditions, includesMaterials, estimatedDurationHours, startDateEstimate
    ];

    const result = await req.db.query(quoteQuery, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tradespeople/:id/quotes
// @desc    Get quotes by tradesperson
// @access  Private
router.get('/:id/quotes', auth, async (req, res) => {
  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findByUserId(req.user.id);
    
    if (!profile || profile.id !== parseInt(req.params.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const quotesQuery = `
      SELECT q.*, j.title as job_title, j.description as job_description,
             u.first_name, u.last_name
      FROM tradesperson_quotes q
      JOIN jobs j ON q.job_id = j.id
      JOIN users u ON j.user_id = u.id
      WHERE q.tradesperson_id = $1
      ORDER BY q.created_at DESC
    `;

    const result = await req.db.query(quotesQuery, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tradespeople/:id/apply
// @desc    Apply for a job
// @access  Private
router.post('/:id/apply', [
  auth,
  body('jobId', 'Job ID is required').not().isEmpty(),
  body('message', 'Message is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tradesperson = new Tradesperson(req.db);
    const profile = await tradesperson.findByUserId(req.user.id);
    
    if (!profile || profile.id !== parseInt(req.params.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      jobId, message, proposedStartDate, proposedDurationHours, proposedPrice
    } = req.body;

    // Check if already applied
    const existingApplication = await req.db.query(
      'SELECT id FROM job_applications WHERE job_id = $1 AND tradesperson_id = $2',
      [jobId, req.params.id]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    const applicationQuery = `
      INSERT INTO job_applications (
        job_id, tradesperson_id, message, proposed_start_date,
        proposed_duration_hours, proposed_price
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      jobId, req.params.id, message, proposedStartDate,
      proposedDurationHours, proposedPrice
    ];

    const result = await req.db.query(applicationQuery, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

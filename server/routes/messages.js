const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message between tradesperson and homeowner
// @access  Private
router.post('/', [
  auth,
  body('jobId', 'Job ID is required').isInt(),
  body('message', 'Message is required').not().isEmpty(),
  body('senderId', 'Sender ID is required').isInt(),
  body('senderType', 'Sender type is required').isIn(['tradesperson', 'homeowner'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    jobId,
    tradespersonId,
    homeownerId,
    message,
    senderId,
    senderType
  } = req.body;

  try {
    // Verify the user is authorized to send this message
    if (senderId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to send this message' });
    }

    // Create message
    const newMessage = await req.db.query(
      `INSERT INTO messages (job_id, tradesperson_id, homeowner_id, message, sender_id, sender_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [jobId, tradespersonId, homeownerId, message, senderId, senderType]
    );

    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/messages/:jobId/:userId
// @desc    Get messages for a specific job and user
// @access  Private
router.get('/:jobId/:userId', auth, async (req, res) => {
  try {
    const { jobId, userId } = req.params;

    // Verify the user is authorized to view these messages
    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view these messages' });
    }

    const messages = await req.db.query(
      `SELECT * FROM messages 
       WHERE job_id = $1 AND (tradesperson_id = $2 OR homeowner_id = $2)
       ORDER BY created_at ASC`,
      [jobId, userId]
    );

    res.json(messages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/messages/conversations/:userId
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the user is authorized to view these conversations
    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view these conversations' });
    }

    const conversations = await req.db.query(
      `SELECT DISTINCT 
         j.id as job_id, j.title as job_title, j.status as job_status,
         u.first_name, u.last_name, u.email,
         (SELECT COUNT(*) FROM messages m WHERE m.job_id = j.id) as message_count,
         (SELECT MAX(created_at) FROM messages m WHERE m.job_id = j.id) as last_message_at
       FROM messages m
       JOIN jobs j ON m.job_id = j.id
       JOIN users u ON (m.tradesperson_id = u.id OR m.homeowner_id = u.id)
       WHERE (m.tradesperson_id = $1 OR m.homeowner_id = $1) AND u.id != $1
       ORDER BY last_message_at DESC`,
      [userId]
    );

    res.json(conversations.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

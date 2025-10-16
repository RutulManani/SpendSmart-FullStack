const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const streakController = require('../controllers/streakController');

// Get user streak info
router.get('/my-streak', auth, async (req, res) => {
  try {
    const streakInfo = await streakController.getUserStreak(req.userId);
    if (!streakInfo) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(streakInfo);
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to get streak information' });
  }
});

module.exports = router;
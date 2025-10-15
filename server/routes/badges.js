// server/routes/badges.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getUserBadges,
  getBadgeById
} = require('../controllers/badgeController');

// Public routes
router.get('/', getAllBadges);
router.get('/:id', getBadgeById);

// User routes
router.get('/user/my-badges', auth, getUserBadges);

// Admin routes
router.post('/', adminAuth, createBadge);
router.put('/:id', adminAuth, updateBadge);
router.delete('/:id', adminAuth, deleteBadge);

module.exports = router;
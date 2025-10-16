const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const badgeController = require('../controllers/badgeController');

// Get all badges (public)
router.get('/', badgeController.getAllBadges);

// Get user's badges
router.get('/my-badges', auth, badgeController.getUserBadges);

// Get badge by ID
router.get('/:id', badgeController.getBadgeById);

// Badge leaderboard
router.get('/leaderboard/global', badgeController.getBadgeLeaderboard);

// Badges by rarity
router.get('/rarity/:rarity', badgeController.getBadgesByRarity);

// Badge statistics
router.get('/stats/overview', badgeController.getBadgeStatistics);
router.get('/stats/me', auth, badgeController.getBadgeStats);

module.exports = router;
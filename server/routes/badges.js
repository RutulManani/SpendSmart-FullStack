// server/routes/badges.js
const express = require('express');
const router = express.Router();

// ===== Option A (preferred): if your file is named "badgesController.js"
const badgeController = require('../controllers/badgeController.js');

// ===== Option B (use this line instead if your file is named "badgeController.js")
//const badgesController = require('../controllers/badgeController.js');

const auth = require('../middleware/auth');

// small guard for admin endpoints
function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// All badges routes require auth
router.use(auth);

// Destructure once so handlers are guaranteed to be functions
const {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  awardBadgeToUser,
  getBadgeById,
  getUserBadges,
  getBadgeLeaderboard,
  getBadgesByRarity,
  getBadgeStatistics,
  getBadgeStats,
  checkAndAwardBadges
} = badgeController;

/* ---- specific routes first ---- */
router.get('/stats/overview', getBadgeStatistics);
router.get('/stats/me',       getBadgeStats);
router.get('/leaderboard',    getBadgeLeaderboard);
router.get('/user/my-badges', getUserBadges);
router.get('/rarity/:rarity', getBadgesByRarity);

// helper: trigger auto-award check for a user
router.get('/check/:userId', async (req, res) => {
  try {
    await checkAndAwardBadges(req.params.userId);
    res.json({ ok: true });
  } catch (e) {
    console.error('Auto-award error:', e);
    res.status(500).json({ error: 'Error running auto-award' });
  }
});

/* ---- CRUD ---- */
router.get('/',       getAllBadges);
router.post('/',      requireAdmin, createBadge);
router.put('/:id',    requireAdmin, updateBadge);
router.delete('/:id', requireAdmin, deleteBadge);

// keep this after specific routes to avoid conflicts
router.get('/:id', getBadgeById);

// award (admin)
router.post('/award', requireAdmin, awardBadgeToUser);

module.exports = router;
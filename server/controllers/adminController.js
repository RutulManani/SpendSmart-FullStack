// server/controllers/adminController.js
const User = require('../models/User');
const Category = require('../models/Category');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');

exports.getStats = async (_req, res) => {
  try {
    const [totalUsers, totalChallenges, totalCategories, totalBadges] =
      await Promise.all([
        User.countDocuments(),
        Challenge.countDocuments(),
        Category.countDocuments(),
        Badge.countDocuments(),
      ]);

    res.json({ totalUsers, totalChallenges, totalCategories, totalBadges });
  } catch {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

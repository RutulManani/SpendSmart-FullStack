const Badge = require('../models/Badge');
const User = require('../models/User');
const UserChallenge = require('../models/UserChallenge');
const Expense = require('../models/Expense');

/* =========================
   BASIC CRUD
   ========================= */

// GET /api/badges
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ rarityOrder: -1, createdAt: -1 });
    res.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Error fetching badges' });
  }
};

// GET /api/badges/user/my-badges
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('badges').populate('badges.badgeId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ badges: user.badges });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Error fetching user badges' });
  }
};

// GET /api/badges/:id
exports.getBadgeById = async (req, res) => {
  try {
    const { id } = req.params;
    const badge = await Badge.findById(id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });

    const earnedCount = await User.countDocuments({ 'badges.badgeId': id });
    res.json({ badge, earnedBy: earnedCount });
  } catch (error) {
    console.error('Get badge by ID error:', error);
    res.status(500).json({ error: 'Error fetching badge' });
  }
};

// GET /api/badges/leaderboard/global
exports.getBadgeLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await User.aggregate([
      { $match: { role: 'user' } },
      { $project: { name: 1, email: 1, badgeCount: { $size: '$badges' }, currentStreak: 1 } },
      { $sort: { badgeCount: -1, currentStreak: -1 } },
      { $limit: parseInt(limit) }
    ]);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get badge leaderboard error:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
};

// GET /api/badges/rarity/:rarity
exports.getBadgesByRarity = async (req, res) => {
  try {
    const { rarity } = req.params;
    const valid = ['common', 'rare', 'epic', 'legendary'];
    if (!valid.includes(rarity)) return res.status(400).json({ error: 'Invalid rarity level' });

    const badges = await Badge.find({ rarity, isActive: true }).sort({ createdAt: -1 });
    res.json({ badges, rarity });
  } catch (error) {
    console.error('Get badges by rarity error:', error);
    res.status(500).json({ error: 'Error fetching badges' });
  }
};

// GET /api/badges/stats/overview
exports.getBadgeStatistics = async (req, res) => {
  try {
    const totalBadges = await Badge.countDocuments({ isActive: true });

    const badgesByRarity = await Badge.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$rarity', count: { $sum: 1 } } }
    ]);

    const mostEarnedBadges = await User.aggregate([
      { $unwind: '$badges' },
      { $group: { _id: '$badges.badgeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'badges', localField: '_id', foreignField: '_id', as: 'badge' } },
      { $unwind: '$badge' }
    ]);

    res.json({ totalBadges, badgesByRarity, mostEarnedBadges });
  } catch (error) {
    console.error('Get badge statistics error:', error);
    res.status(500).json({ error: 'Error fetching badge statistics' });
  }
};

// GET /api/badges/stats/me
exports.getBadgeStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalBadges = await Badge.countDocuments({ isActive: true });
    const earnedBadges = user.badges.length;

    const badgeDetails = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$badges' },
      { $lookup: { from: 'badges', localField: 'badges.badgeId', foreignField: '_id', as: 'badgeInfo' } },
      { $unwind: '$badgeInfo' },
      { $group: { _id: '$badgeInfo.rarity', count: { $sum: 1 } } }
    ]);

    const rarityBreakdown = { common: 0, rare: 0, epic: 0, legendary: 0 };
    badgeDetails.forEach(item => { rarityBreakdown[item._id] = item.count; });

    res.json({
      totalBadges,
      earnedBadges,
      progress: totalBadges > 0 ? ((earnedBadges / totalBadges) * 100).toFixed(2) : 0,
      rarityBreakdown,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    });
  } catch (error) {
    console.error('Get badge stats error:', error);
    res.status(500).json({ error: 'Error fetching badge statistics' });
  }
};

// POST /api/badges  (admin)
exports.createBadge = async (req, res) => {
  try {
    // Set default criteria if not provided
    const badgeData = {
      ...req.body,
      criteria: req.body.criteria || { type: 'custom', value: 0 }
    };

    // Set rarity order based on rarity
    const rarityOrderMap = { common: 1, rare: 2, epic: 3, legendary: 4 };
    badgeData.rarityOrder = rarityOrderMap[badgeData.rarity] || 1;

    const badge = new Badge(badgeData);
    await badge.save();
    res.status(201).json({ message: 'Badge created successfully', badge });
  } catch (error) {
    console.error('Create badge error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Error creating badge' });
  }
};

// PUT /api/badges/:id  (admin)
exports.updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Set rarity order if rarity is being updated
    if (req.body.rarity) {
      const rarityOrderMap = { common: 1, rare: 2, epic: 3, legendary: 4 };
      req.body.rarityOrder = rarityOrderMap[req.body.rarity] || 1;
    }

    const badge = await Badge.findByIdAndUpdate(
      id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    );
    
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge updated successfully', badge });
  } catch (error) {
    console.error('Update badge error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Error updating badge' });
  }
};

// DELETE /api/badges/:id  (admin)
exports.deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const badge = await Badge.findByIdAndDelete(id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ error: 'Error deleting badge' });
  }
};

// POST /api/badges/award  (admin)
exports.awardBadgeToUser = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    const user = await User.findById(userId);
    const badge = await Badge.findById(badgeId);
    if (!user || !badge) return res.status(404).json({ error: 'User or badge not found' });

    const hasBadge = user.badges.some(b => b.badgeId.toString() === badgeId);
    if (hasBadge) return res.status(400).json({ error: 'User already has this badge' });

    user.badges.push({ badgeId: badge._id, earnedAt: new Date() });
    await user.save();

    res.json({ message: 'Badge awarded successfully', user });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ error: 'Error awarding badge' });
  }
};

// Internal utility used by routes to kick off auto-award
exports.checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId).populate('badges.badgeId');
    if (!user) return;

    const allBadges = await Badge.find({ isActive: true });
    for (const badge of allBadges) {
      const hasBadge = user.badges.some(b => b.badgeId && b.badgeId._id.toString() === badge._id.toString());
      if (hasBadge) continue;

      const meetsRequirement = await checkBadgeRequirement(userId, badge);
      if (meetsRequirement) {
        user.badges.push({ badgeId: badge._id, earnedAt: new Date() });
        await user.save();
        console.log(`Badge "${badge.name}" awarded to user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Check and award badges error:', error);
  }
};

/* ===== Helpers for criteria checks ===== */

async function checkBadgeRequirement(userId, badge) {
  const { criteria } = badge;
  switch (criteria?.type) {
    case 'streak': return checkStreakRequirement(userId, criteria.value);
    case 'challenges_completed': return checkChallengesCompletedRequirement(userId, criteria.value);
    case 'expenses_logged': return checkExpensesLoggedRequirement(userId, criteria.value);
    case 'savings': return checkSavingsRequirement(userId, criteria.value);
    case 'custom':
    default: return false;
  }
}

async function checkStreakRequirement(userId, requiredStreak) {
  try {
    const user = await User.findById(userId);
    return user && (user.currentStreak || 0) >= requiredStreak;
  } catch (e) { console.error('Check streak requirement error:', e); return false; }
}

async function checkChallengesCompletedRequirement(userId, requiredCount) {
  try {
    const completedCount = await UserChallenge.countDocuments({ userId, status: 'completed' });
    return completedCount >= requiredCount;
  } catch (e) { console.error('Check challenges completed requirement error:', e); return false; }
}

async function checkExpensesLoggedRequirement(userId, requiredCount) {
  try {
    const expenseCount = await Expense.countDocuments({ userId });
    return expenseCount >= requiredCount;
  } catch (e) { console.error('Check expenses logged requirement error:', e); return false; }
}

async function checkSavingsRequirement(userId, requiredAmount) {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const expenses = await Expense.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
    ]);

    const totalSpent = expenses[0]?.totalSpent || 0;
    const monthlyBudget = user.settings?.monthlyBudget || 0;
    const savings = monthlyBudget - totalSpent;
    return savings >= requiredAmount;
  } catch (e) { console.error('Check savings requirement error:', e); return false; }
}
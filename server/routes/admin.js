// server/routes/admin.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

const Category = require('../models/Category');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const User = require('../models/User');

const Expense = require('../models/Expense');
const UserChallenge = require('../models/UserChallenge');

// Helper to send friendly errors
const sendError = (res, err, fallback = 'Request failed') => {
  const message =
    err?.message ||
    err?.errors?.[Object.keys(err.errors || {})[0]]?.message ||
    err?.response?.data?.error ||
    fallback;
  return res.status(400).json({ error: message });
};

// Dashboard stats
router.get('/stats', adminAuth, async (_req, res) => {
  try {
    const [totalUsers, totalChallenges, totalCategories, totalBadges] =
      await Promise.all([
        User.countDocuments(),
        Challenge.countDocuments(),
        Category.countDocuments(),
        Badge.countDocuments(),
      ]);
    res.json({ totalUsers, totalChallenges, totalCategories, totalBadges });
  } catch (err) {
    return sendError(res, err, 'Failed to fetch admin stats');
  }
});

/** ===================== Categories ===================== */
router.get('/categories', adminAuth, async (_req, res) => {
  try {
    const items = await Category.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    return sendError(res, err, 'Failed to load categories');
  }
});

router.post('/categories', adminAuth, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.userId,
    };
    // normalize: if name missing but title exists, keep as-is (model ensures one exists)
    const item = await Category.create(payload);
    res.json(item);
  } catch (err) {
    return sendError(res, err, 'Failed to create category');
  }
});

router.put('/categories/:id', adminAuth, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    return sendError(res, err, 'Failed to update category');
  }
});

router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 'Failed to delete category');
  }
});

/** ===================== Challenges ===================== */
router.get('/challenges', adminAuth, async (_req, res) => {
  try {
    const items = await Challenge.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    return sendError(res, err, 'Failed to load challenges');
  }
});

router.post('/challenges', adminAuth, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.userId,
    };

    // Try to coerce date strings if present
    if (payload.startDate && typeof payload.startDate === 'string') {
      const d = new Date(payload.startDate);
      if (!isNaN(d)) payload.startDate = d;
    }
    if (payload.endDate && typeof payload.endDate === 'string') {
      const d = new Date(payload.endDate);
      if (!isNaN(d)) payload.endDate = d;
    }

    const item = await Challenge.create(payload);
    res.json(item);
  } catch (err) {
    return sendError(res, err, 'Failed to create challenge');
  }
});

router.put('/challenges/:id', adminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.startDate && typeof payload.startDate === 'string') {
      const d = new Date(payload.startDate);
      if (!isNaN(d)) payload.startDate = d;
    }
    if (payload.endDate && typeof payload.endDate === 'string') {
      const d = new Date(payload.endDate);
      if (!isNaN(d)) payload.endDate = d;
    }

    const updated = await Challenge.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    return sendError(res, err, 'Failed to update challenge');
  }
});

router.delete('/challenges/:id', adminAuth, async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 'Failed to delete challenge');
  }
});

/** ===================== Badges ===================== */
router.get('/badges', adminAuth, async (_req, res) => {
  try {
    const items = await Badge.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    return sendError(res, err, 'Failed to load badges');
  }
});

router.post('/badges', adminAuth, async (req, res) => {
  try {
    const item = await Badge.create({ ...req.body, createdBy: req.userId });
    res.json(item);
  } catch (err) {
    return sendError(res, err, 'Failed to create badge');
  }
});

router.put('/badges/:id', adminAuth, async (req, res) => {
  try {
    const updated = await Badge.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    return sendError(res, err, 'Failed to update badge');
  }
});

router.delete('/badges/:id', adminAuth, async (req, res) => {
  try {
    await Badge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 'Failed to delete badge');
  }
});



/** ===================== User Management ===================== */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const expenses = await Expense.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, totalSpent: { $sum: '$amount' }, count: { $sum: 1 } } }
          ]);

          const challenges = await UserChallenge.aggregate([
            { $match: { userId: user._id } },
            { 
              $group: { 
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]);

          const completedChallenges = challenges.find(c => c._id === 'completed')?.count || 0;
          const totalChallenges = challenges.reduce((sum, c) => sum + c.count, 0);

          // Get badge count safely
          let badgeCount = 0;
          if (user.badges && Array.isArray(user.badges)) {
            badgeCount = user.badges.length;
          }

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile || {},
            preferences: user.preferences || {},
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            totalSpent: expenses[0]?.totalSpent || 0,
            expenseCount: expenses[0]?.count || 0,
            completedChallenges,
            totalChallenges,
            badgeCount: badgeCount,
            currentStreak: user.currentStreak || 0,
            longestStreak: user.longestStreak || 0
          };
        } catch (userError) {
          console.error(`Error processing user ${user._id}:`, userError);
          // Return basic user info even if stats fail
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile || {},
            preferences: user.preferences || {},
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            totalSpent: 0,
            expenseCount: 0,
            completedChallenges: 0,
            totalChallenges: 0,
            badgeCount: 0,
            currentStreak: 0,
            longestStreak: 0
          };
        }
      })
    );

    res.json(usersWithStats);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Failed to load users' });
  }
});

router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const expenses = await Expense.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: { 
          _id: null, 
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
          averageSpent: { $avg: '$amount' }
        } 
      }
    ]);

    const challenges = await UserChallenge.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: { 
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const expensesByCategory = await Expense.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: { 
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const expensesByMood = await Expense.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: { 
          _id: '$mood',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get badges with populated badge data if available
    let badges = [];
    if (user.badges && user.badges.length > 0) {
      try {
        const badgeIds = user.badges.map(b => b.badgeId).filter(id => id);
        if (badgeIds.length > 0) {
          const badgeData = await Badge.find({ _id: { $in: badgeIds } });
          badges = user.badges.map(userBadge => {
            const badgeInfo = badgeData.find(b => b._id.toString() === userBadge.badgeId?.toString());
            return {
              badgeId: badgeInfo || { name: 'Unknown Badge' },
              earnedAt: userBadge.earnedAt
            };
          });
        }
      } catch (badgeError) {
        console.error('Error populating badges:', badgeError);
        // Fallback to basic badge info
        badges = user.badges.map(userBadge => ({
          badgeId: { name: 'Unknown Badge' },
          earnedAt: userBadge.earnedAt
        }));
      }
    }

    const userStats = {
      totalSpent: expenses[0]?.totalSpent || 0,
      expenseCount: expenses[0]?.count || 0,
      averageSpent: expenses[0]?.averageSpent || 0,
      challenges: challenges.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      expensesByCategory,
      expensesByMood,
      completedChallenges: challenges.find(c => c._id === 'completed')?.count || 0,
      totalChallenges: challenges.reduce((sum, c) => sum + c.count, 0),
      badgeCount: badges.length
    };

    res.json({ user: { ...user.toObject(), badges }, stats: userStats });
  } catch (err) {
    console.error('Get user details error:', err);
    return res.status(500).json({ error: 'Failed to load user details' });
  }
});

module.exports = router;
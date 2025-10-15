// server/controllers/badgeController.js
const Badge = require('../models/Badge');
const User = require('../models/User');
const UserChallenge = require('../models/UserChallenge');
const Expense = require('../models/Expense');

/* =========================
   BASIC CRUD
   ========================= */

// GET /api/badges
async function getAllBadges(req, res) {
  try {
    const badges = await Badge.find({}).sort({ createdAt: -1 });
    res.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Error fetching badges' });
  }
}

// POST /api/badges  (admin)
async function createBadge(req, res) {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.status(201).json({ message: 'Badge created successfully', badge });
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({ error: 'Error creating badge' });
  }
}

// PUT /api/badges/:id  (admin)
async function updateBadge(req, res) {
  try {
    const { id } = req.params;
    const badge = await Badge.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge updated successfully', badge });
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ error: 'Error updating badge' });
  }
}

// DELETE /api/badges/:id  (admin)
async function deleteBadge(req, res) {
  try {
    const { id } = req.params;
    const badge = await Badge.findByIdAndDelete(id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ error: 'Error deleting badge' });
  }
}

/* =========================
   BADGE AWARDING SYSTEM
   ========================= */

// Award badge to user when challenge is completed
async function awardBadgeForChallengeCompletion(userId, challengeId) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Get all badges that can be earned for challenge completion
    const challengeBadges = await Badge.find({});
    
    // If no badges exist in database, return empty array
    if (!challengeBadges || challengeBadges.length === 0) {
      return [];
    }

    let awardedBadges = [];

    for (const badge of challengeBadges) {
      // Check if user already has this badge
      const hasBadge = user.badges && user.badges.some(b => 
        b.badgeId && b.badgeId.toString() === badge._id.toString()
      );
      
      if (hasBadge) continue;

      // Check if badge should be awarded for this challenge completion
      const shouldAward = await checkBadgeCriteria(userId, badge, challengeId);
      
      if (shouldAward) {
        // Initialize badges array if it doesn't exist
        if (!user.badges) {
          user.badges = [];
        }
        
        user.badges.push({ 
          badgeId: badge._id, 
          earnedAt: new Date(),
          challengeId: challengeId
        });
        awardedBadges.push(badge);
        console.log(`🎉 Badge "${badge.name || badge.title}" awarded to user ${userId}`);
      }
    }

    if (awardedBadges.length > 0) {
      await user.save();
    }

    return awardedBadges;
  } catch (error) {
    console.error('Award badge for challenge completion error:', error);
    return [];
  }
}

// Check badge criteria
async function checkBadgeCriteria(userId, badge, challengeId) {
  if (!badge.criteria) return false;

  const { type, value } = badge.criteria;
  
  try {
    switch (type) {
      case 'first_challenge':
        // Award for completing first challenge
        const completedChallenges = await UserChallenge.countDocuments({ 
          userId, 
          status: 'completed' 
        });
        return completedChallenges >= value;

      case 'streak':
        const user = await User.findById(userId);
        return user && (user.currentStreak || 0) >= value;

      case 'challenges_completed':
        const totalCompleted = await UserChallenge.countDocuments({ 
          userId, 
          status: 'completed' 
        });
        return totalCompleted >= value;

      case 'specific_challenge':
        // Award for completing a specific challenge
        const challengeCompletion = await UserChallenge.findOne({
          userId,
          challengeId,
          status: 'completed'
        });
        return !!challengeCompletion;

      default:
        return false;
    }
  } catch (error) {
    console.error('Check badge criteria error:', error);
    return false;
  }
}

// Get user's badges
async function getUserBadges(req, res) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
      .select('badges')
      .populate('badges.badgeId');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Return empty array if no badges
    res.json({ badges: user.badges || [] });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Error fetching user badges' });
  }
}

// Get badge by ID
async function getBadgeById(req, res) {
  try {
    const { id } = req.params;
    const badge = await Badge.findById(id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ badge });
  } catch (error) {
    console.error('Get badge by ID error:', error);
    res.status(500).json({ error: 'Error fetching badge' });
  }
}

module.exports = {
  // CRUD
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  // Badge awarding
  awardBadgeForChallengeCompletion,
  getUserBadges,
  getBadgeById
};
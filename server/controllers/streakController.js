const User = require('../models/User');
const Badge = require('../models/Badge');

// Update user login streak
exports.updateLoginStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const currentStreak = user.updateLoginStreak();
    await user.save();

    // Check for streak badges
    await checkStreakBadges(userId, currentStreak);

    return currentStreak;
  } catch (error) {
    console.error('Update login streak error:', error);
    return null;
  }
};

// Update user expense streak
exports.updateExpenseStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const currentStreak = user.updateExpenseStreak();
    await user.save();

    // Check for streak badges
    await checkStreakBadges(userId, currentStreak);

    return currentStreak;
  } catch (error) {
    console.error('Update expense streak error:', error);
    return null;
  }
};

// Check and award streak badges
async function checkStreakBadges(userId, currentStreak) {
  try {
    const user = await User.findById(userId).populate('badges.badgeId');
    const streakBadges = await Badge.find({ 
      'criteria.type': 'streak',
      isActive: true 
    });

    for (const badge of streakBadges) {
      const hasBadge = user.badges.some(b => 
        b.badgeId && b.badgeId._id.toString() === badge._id.toString()
      );
      
      if (!hasBadge && currentStreak >= badge.criteria.value) {
        user.badges.push({ badgeId: badge._id });
        await user.save();
        console.log(`🎉 Awarded ${badge.name} to user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Check streak badges error:', error);
  }
}

// Get user streak info
exports.getUserStreak = async (userId) => {
  try {
    const user = await User.findById(userId).select('currentStreak longestStreak lastLoginDate lastExpenseDate');
    if (!user) return null;

    return {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastLoginDate: user.lastLoginDate,
      lastExpenseDate: user.lastExpenseDate
    };
  } catch (error) {
    console.error('Get user streak error:', error);
    return null;
  }
};
const Expense = require('../models/Expense');
const User = require('../models/User');
const UserChallenge = require('../models/UserChallenge');

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, category, mood, note, date } = req.body;
    const userId = req.userId;

    // Create expense
    const expense = new Expense({
      userId,
      amount,
      category,
      mood,
      note,
      date: date || new Date()
    });

    await expense.save();

    // Update user streak
    await updateUserStreak(userId);

    // Update active challenges progress
    await updateChallengeProgress(userId, expense);

    res.status(201).json({
      message: 'Expense logged successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Error creating expense' });
  }
};

// Get all expenses for user
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, category, mood, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (category) query.category = category;
    if (mood) query.mood = mood;

    // Execute query with pagination
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalExpenses: count
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const expense = await Expense.findOne({ _id: id, userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (['amount', 'category', 'mood', 'note', 'date'].includes(key)) {
        expense[key] = updates[key];
      }
    });

    await expense.save();

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Error updating expense' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Error deleting expense' });
  }
};

// Get spending insights
exports.getInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate spending by category
    const categorySpending = await Expense.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Aggregate spending by mood
    const moodSpending = await Expense.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$mood',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Daily spending trend
    const dailyTrend = await Expense.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      categorySpending,
      moodSpending,
      dailyTrend,
      insights: generateInsights(categorySpending, moodSpending)
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Error generating insights' });
  }
};

// Helper function to update user streak
async function updateUserStreak(userId) {
  try {
    const user = await User.findById(userId);
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0) : null;

    if (!lastActive || today - lastActive > 86400000) {
      // More than a day has passed, reset streak
      user.currentStreak = 1;
    } else if (today > lastActive) {
      // New day, increment streak
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    }

    user.lastActiveDate = new Date();
    await user.save();

    // Check for streak-based badges
    await checkStreakBadges(user);
  } catch (error) {
    console.error('Update streak error:', error);
  }
}

// Helper function to update challenge progress
async function updateChallengeProgress(userId, expense) {
  try {
    // Find active challenges for user
    const activeChallenges = await UserChallenge.find({
      userId,
      status: 'active'
    }).populate('challengeId');

    for (const userChallenge of activeChallenges) {
      // Update progress based on mood
      const moodPoints = {
        'happy': 10,
        'excited': 10,
        'relaxed': 10,
        'neutral': 5,
        'bored': -5,
        'sad': -10,
        'stressed': -10,
        'angry': -10
      };

      const points = moodPoints[expense.mood] || 0;
      userChallenge.progress = Math.min(100, Math.max(0, userChallenge.progress + points));

      // Check if challenge is completed
      if (userChallenge.progress >= 100) {
        userChallenge.status = 'completed';
        userChallenge.completedAt = new Date();
        userChallenge.pointsEarned = userChallenge.challengeId.pointsReward;
      }

      await userChallenge.save();
    }
  } catch (error) {
    console.error('Update challenge progress error:', error);
  }
}

// Helper function to check for streak badges
async function checkStreakBadges(user) {
  try {
    const Badge = require('../models/Badge');
    
    // Find streak-based badges
    const streakBadges = await Badge.find({
      'criteria.type': 'streak',
      isActive: true
    });

    for (const badge of streakBadges) {
      if (user.currentStreak >= badge.criteria.value) {
        // Check if user already has this badge
        const hasBadge = user.badges.some(b => b.badgeId.toString() === badge._id.toString());
        
        if (!hasBadge) {
          user.badges.push({
            badgeId: badge._id,
            earnedAt: new Date()
          });
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Check badges error:', error);
  }
}

// Helper function to generate insights
function generateInsights(categorySpending, moodSpending) {
  const insights = [];

  // Find highest spending category
  if (categorySpending.length > 0) {
    const highestCategory = categorySpending[0];
    insights.push(`Your highest spending category is ${highestCategory._id} with $${highestCategory.total.toFixed(2)}`);
  }

  // Find mood with highest average spending
  if (moodSpending.length > 0) {
    const highestMoodAvg = moodSpending.reduce((prev, current) => 
      (prev.avgAmount > current.avgAmount) ? prev : current
    );
    insights.push(`You tend to spend more when feeling ${highestMoodAvg._id} (avg: $${highestMoodAvg.avgAmount.toFixed(2)})`);
  }

  // Add suggestion based on negative mood spending
  const negativeMoods = ['sad', 'stressed', 'angry', 'bored'];
  const negativeMoodSpending = moodSpending.filter(m => negativeMoods.includes(m._id));
  
  if (negativeMoodSpending.length > 0) {
    const totalNegative = negativeMoodSpending.reduce((sum, m) => sum + m.total, 0);
    insights.push(`Consider healthier coping strategies - you've spent $${totalNegative.toFixed(2)} during negative emotional states`);
  }

  return insights;
}

module.exports = exports;
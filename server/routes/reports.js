const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const UserChallenge = require('../models/UserChallenge');

// All routes require authentication
router.use(auth);

// Generate spending report
router.get('/spending', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'category' } = req.query;
    const userId = req.userId;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { userId };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    let groupStage;
    switch (groupBy) {
      case 'category':
        groupStage = { _id: '$category' };
        break;
      case 'mood':
        groupStage = { _id: '$mood' };
        break;
      case 'day':
        groupStage = { 
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$date' } 
          } 
        };
        break;
      case 'week':
        groupStage = { 
          _id: { 
            $dateToString: { format: '%Y-%U', date: '$date' } 
          } 
        };
        break;
      case 'month':
        groupStage = { 
          _id: { 
            $dateToString: { format: '%Y-%m', date: '$date' } 
          } 
        };
        break;
      default:
        groupStage = { _id: '$category' };
    }

    const spendingReport = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get overall statistics
    const overallStats = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageSpent: { $avg: '$amount' },
          dailyAverage: { 
            $avg: {
              $cond: [
                { $ne: [{ $size: '$date' }, 0] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      report: spendingReport,
      overallStats: overallStats[0] || {},
      parameters: {
        startDate,
        endDate,
        groupBy
      }
    });
  } catch (error) {
    console.error('Generate spending report error:', error);
    res.status(500).json({ error: 'Error generating spending report' });
  }
});

// Generate challenge performance report
router.get('/challenges', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { userId };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.startedAt = dateFilter;
    }

    const challengeReport = await UserChallenge.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'challenges',
          localField: 'challengeId',
          foreignField: '_id',
          as: 'challenge'
        }
      },
      { $unwind: '$challenge' },
      {
        $group: {
          _id: '$challenge.category',
          totalChallenges: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          abandoned: {
            $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] }
          },
          totalPoints: { $sum: '$pointsEarned' },
          averageProgress: { $avg: '$progress' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalChallenges: 1,
          completed: 1,
          failed: 1,
          abandoned: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completed', '$totalChallenges'] },
              100
            ]
          },
          totalPoints: 1,
          averageProgress: 1
        }
      },
      { $sort: { totalChallenges: -1 } }
    ]);

    // Get overall challenge statistics
    const overallStats = await UserChallenge.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalChallenges: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalPoints: { $sum: '$pointsEarned' },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    res.json({
      challengeReport,
      overallStats: overallStats[0] || {},
      parameters: { startDate, endDate }
    });
  } catch (error) {
    console.error('Generate challenge report error:', error);
    res.status(500).json({ error: 'Error generating challenge report' });
  }
});

// Generate mood analysis report
router.get('/mood-analysis', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { userId };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    const moodAnalysis = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$mood',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $project: {
          mood: '$_id',
          totalSpent: 1,
          transactionCount: 1,
          averageAmount: 1,
          categoryCount: { $size: '$categories' },
          percentageOfTotal: 0 // Will calculate in code
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Calculate total for percentages
    const totalSpentResult = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalSpent = totalSpentResult[0]?.total || 0;

    // Add percentages
    const moodAnalysisWithPercentages = moodAnalysis.map(item => ({
      ...item,
      percentageOfTotal: totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0
    }));

    // Get mood trends over time
    const moodTrends = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            mood: '$mood'
          },
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    res.json({
      moodAnalysis: moodAnalysisWithPercentages,
      moodTrends,
      parameters: { startDate, endDate }
    });
  } catch (error) {
    console.error('Generate mood analysis error:', error);
    res.status(500).json({ error: 'Error generating mood analysis' });
  }
});

// Generate comprehensive financial health report
router.get('/financial-health', async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get spending data
    const spendingData = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          dailyTotal: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category distribution
    const categoryDistribution = await Expense.aggregate([
      {
        $match: {
          userId,
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

    // Get mood impact
    const moodImpact = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$mood',
          total: { $sum: '$amount' },
          average: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get challenge performance
    const challengePerformance = await UserChallenge.aggregate([
      {
        $match: {
          userId,
          startedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsEarned' }
        }
      }
    ]);

    // Calculate financial health score
    let healthScore = 100;

    // Deduct points based on spending patterns
    const totalSpent = categoryDistribution.reduce((sum, cat) => sum + cat.total, 0);
    const avgDailySpent = totalSpent / 30;
    
    if (avgDailySpent > 100) healthScore -= 20;
    else if (avgDailySpent > 50) healthScore -= 10;

    // Add points for challenge completion
    const completedChallenges = challengePerformance.find(c => c._id === 'completed');
    if (completedChallenges) {
      healthScore += completedChallenges.count * 5;
    }

    // Ensure score is within bounds
    healthScore = Math.max(0, Math.min(100, healthScore));

    res.json({
      healthScore: Math.round(healthScore),
      spendingOverview: {
        totalSpent,
        avgDailySpent,
        totalTransactions: spendingData.reduce((sum, day) => sum + day.count, 0),
        spendingTrend: spendingData
      },
      categoryDistribution,
      moodImpact,
      challengePerformance,
      recommendations: generateRecommendations(healthScore, categoryDistribution, moodImpact)
    });
  } catch (error) {
    console.error('Generate financial health report error:', error);
    res.status(500).json({ error: 'Error generating financial health report' });
  }
});

// Helper function to generate recommendations
function generateRecommendations(healthScore, categoryDistribution, moodImpact) {
  const recommendations = [];

  if (healthScore < 50) {
    recommendations.push({
      type: 'critical',
      message: 'Consider reviewing your spending habits and setting stricter budgets',
      action: 'Set up budget limits for high-spending categories'
    });
  }

  // Check for high spending in discretionary categories
  const discretionaryCategories = ['entertainment', 'dining', 'shopping'];
  const highSpendingCategories = categoryDistribution.filter(
    cat => discretionaryCategories.includes(cat._id.toLowerCase()) && cat.total > 200
  );

  if (highSpendingCategories.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `High spending detected in: ${highSpendingCategories.map(c => c._id).join(', ')}`,
      action: 'Consider reducing discretionary spending in these areas'
    });
  }

  // Check mood impact
  const negativeMoodSpending = moodImpact.find(mood => 
    ['stressed', 'anxious', 'sad'].includes(mood._id) && mood.total > 100
  );

  if (negativeMoodSpending) {
    recommendations.push({
      type: 'emotional',
      message: 'Noticeable spending during negative emotional states',
      action: 'Try mindfulness exercises before making purchases when feeling this way'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'positive',
      message: 'Great job maintaining healthy financial habits!',
      action: 'Continue tracking and consider setting new financial goals'
    });
  }

  return recommendations;
}

// Export report data
router.post('/export', async (req, res) => {
  try {
    const { reportType, format = 'json', ...params } = req.body;
    const userId = req.userId;

    let reportData;

    switch (reportType) {
      case 'spending':
        // Generate spending report data
        break;
      case 'challenges':
        // Generate challenge report data
        break;
      case 'mood-analysis':
        // Generate mood analysis data
        break;
      case 'financial-health':
        // Generate financial health data
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // In a real application, you would generate files (CSV, PDF, etc.)
    // For now, we'll return JSON
    res.json({
      message: 'Report export functionality would be implemented here',
      reportType,
      format,
      data: reportData
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ error: 'Error exporting report' });
  }
});

module.exports = router;
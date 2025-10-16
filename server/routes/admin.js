const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Add stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        // Get user's expenses count and total spent
        const Expense = require('../models/Expense');
        const expenseStats = await Expense.aggregate([
          { $match: { userId: user._id } },
          { 
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' },
              expenseCount: { $sum: 1 }
            }
          }
        ]);
        
        // Get completed challenges count
        const UserChallenge = require('../models/UserChallenge');
        const completedChallenges = await UserChallenge.countDocuments({ 
          userId: user._id, 
          status: 'completed' 
        });
        
        userObj.totalSpent = expenseStats[0]?.totalSpent || 0;
        userObj.expenseCount = expenseStats[0]?.expenseCount || 0;
        userObj.completedChallenges = completedChallenges;
        userObj.badgeCount = user.badges?.length || 0;
        
        return userObj;
      })
    );
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges.badgeId');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const Expense = require('../models/Expense');
    const expenseStats = await Expense.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
          averageSpent: { $avg: '$amount' }
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
      }
    ]);

    const UserChallenge = require('../models/UserChallenge');
    const completedChallenges = await UserChallenge.countDocuments({ 
      userId: user._id, 
      status: 'completed' 
    });

    res.json({
      user,
      stats: {
        totalSpent: expenseStats[0]?.totalSpent || 0,
        expenseCount: expenseStats[0]?.expenseCount || 0,
        averageSpent: expenseStats[0]?.averageSpent || 0,
        completedChallenges,
        expensesByCategory
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, role, profile, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (profile) updateData.profile = profile;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user's data (expenses, challenges, etc.)
    const Expense = require('../models/Expense');
    const UserChallenge = require('../models/UserChallenge');
    
    await Promise.all([
      Expense.deleteMany({ userId: user._id }),
      UserChallenge.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id)
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
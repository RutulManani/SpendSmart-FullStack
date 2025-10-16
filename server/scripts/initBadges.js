const mongoose = require('mongoose');
const Badge = require('../models/Badge');
require('dotenv').config();

const initializeBadges = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define initial badges
    const initialBadges = [
      {
        name: '3-Day Streak',
        title: 'Consistent Saver',
        description: 'Logged expenses for 3 consecutive days',
        icon: '🔥',
        rarity: 'common',
        rarityOrder: 1,
        criteria: {
          type: 'streak',
          value: 3,
          description: 'Maintain a 3-day expense logging streak'
        },
        color: '#FF6B35',
        backgroundColor: '#2D2D2D',
        points: 10,
        isActive: true
      },
      {
        name: '7-Day Streak',
        title: 'Weekly Warrior',
        description: 'Logged expenses for 7 consecutive days',
        icon: '⚡',
        rarity: 'rare',
        rarityOrder: 2,
        criteria: {
          type: 'streak',
          value: 7,
          description: 'Maintain a 7-day expense logging streak'
        },
        color: '#4ECDC4',
        backgroundColor: '#2D2D2D',
        points: 25,
        isActive: true
      },
      {
        name: '30-Day Streak',
        title: 'Monthly Master',
        description: 'Logged expenses for 30 consecutive days',
        icon: '👑',
        rarity: 'epic',
        rarityOrder: 3,
        criteria: {
          type: 'streak',
          value: 30,
          description: 'Maintain a 30-day expense logging streak'
        },
        color: '#FFD700',
        backgroundColor: '#2D2D2D',
        points: 100,
        isActive: true
      },
      {
        name: 'First Expense',
        title: 'Getting Started',
        description: 'Logged your first expense',
        icon: '🎯',
        rarity: 'common',
        rarityOrder: 1,
        criteria: {
          type: 'expenses_logged',
          value: 1,
          description: 'Log your first expense'
        },
        color: '#45B7D1',
        backgroundColor: '#2D2D2D',
        points: 5,
        isActive: true
      },
      {
        name: 'Challenge Champion',
        title: 'Challenge Completed',
        description: 'Completed your first daily challenge',
        icon: '🏆',
        rarity: 'rare',
        rarityOrder: 2,
        criteria: {
          type: 'challenges_completed',
          value: 1,
          description: 'Complete one daily challenge'
        },
        color: '#96CEB4',
        backgroundColor: '#2D2D2D',
        points: 15,
        isActive: true
      }
    ];

    // Create badges if they don't exist
    for (const badgeData of initialBadges) {
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      
      if (!existingBadge) {
        await Badge.create(badgeData);
        console.log(`✅ Created badge: ${badgeData.name}`);
      } else {
        console.log(`ℹ️  Badge already exists: ${badgeData.name}`);
      }
    }

    console.log('🎉 Badge initialization completed!');
    
    // Show all badges in database
    const allBadges = await Badge.find({});
    console.log(`📊 Total badges in database: ${allBadges.length}`);
    allBadges.forEach(badge => {
      console.log(`- ${badge.name} (${badge.rarity})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing badges:', error);
    process.exit(1);
  }
};

initializeBadges();
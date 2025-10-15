// server/scripts/createDefaultBadges.js
const mongoose = require('mongoose');
require('dotenv').config();

const Badge = require('../models/Badge');

const createDefaultBadges = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const defaultBadges = [
      {
        name: "First Challenge",
        title: "First Step",
        description: "Complete your first challenge",
        points: 10,
        criteria: {
          type: "first_challenge",
          value: 1
        }
      },
      {
        name: "3-Day Streak",
        title: "Consistent Saver",
        description: "Maintain a 3-day challenge streak",
        points: 25,
        criteria: {
          type: "streak",
          value: 3
        }
      },
      {
        name: "7-Day Streak",
        title: "Weekly Warrior",
        description: "Maintain a 7-day challenge streak",
        points: 50,
        criteria: {
          type: "streak",
          value: 7
        }
      },
      {
        name: "Challenge Master",
        title: "Challenge Master",
        description: "Complete 5 different challenges",
        points: 100,
        criteria: {
          type: "challenges_completed",
          value: 5
        }
      }
    ];

    let createdCount = 0;
    for (const badgeData of defaultBadges) {
      const existing = await Badge.findOne({ name: badgeData.name });
      if (!existing) {
        await Badge.create(badgeData);
        createdCount++;
        console.log(`✅ Created badge: ${badgeData.name}`);
      } else {
        console.log(`✓ Badge already exists: ${badgeData.name}`);
      }
    }

    console.log(`\n🎉 Created ${createdCount} new badges`);
    console.log('Total badges in database:', await Badge.countDocuments());

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating default badges:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  createDefaultBadges();
}

module.exports = createDefaultBadges;
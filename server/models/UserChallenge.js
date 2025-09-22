const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'abandoned'],
    default: 'active'
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  streakCount: {
    type: Number,
    default: 1
  }
});

// Index for efficient queries
userChallengeSchema.index({ userId: 1, status: 1 });
userChallengeSchema.index({ userId: 1, challengeId: 1 });

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
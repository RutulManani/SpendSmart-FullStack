const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  rules: {
    type: String,
    required: true
  },
  durationHours: {
    type: Number,
    default: 24
  },
  pointsReward: {
    type: Number,
    default: 100
  },
  category: {
    type: String,
    enum: ['spending', 'saving', 'tracking', 'mood'],
    default: 'spending'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Challenge', challengeSchema);
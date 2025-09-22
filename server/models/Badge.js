const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: '/badges/default.png'
  },
  rule: {
    type: String,
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['streak', 'challenges_completed', 'expenses_logged', 'savings', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', badgeSchema);
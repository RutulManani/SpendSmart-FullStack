const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  icon: { type: String },
  points: { type: Number, default: 0 },
  
  // Badge properties
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  },
  rarityOrder: { type: Number, default: 1 },
  
  // Criteria for earning the badge
  criteria: {
    type: { 
      type: String, 
      enum: ['streak', 'challenges_completed', 'expenses_logged', 'savings', 'custom'],
      required: true 
    },
    value: { type: Number }, // e.g., 3 for 3-day streak
    description: { type: String }
  },
  
  // Visual properties
  color: { type: String, default: '#FFD700' },
  backgroundColor: { type: String, default: '#2D2D2D' },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for better performance
badgeSchema.index({ 'criteria.type': 1, 'criteria.value': 1 });

module.exports = mongoose.model('Badge', badgeSchema);
// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile: {
      age: { type: Number, min: 13, max: 120 },
      currency: { 
        type: String, 
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'MXN']
      },
      monthlyBudget: { type: Number, default: 1000, min: 0 },
      location: { type: String, trim: true },
      occupation: { type: String, trim: true }
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false },
      budgetAlerts: { type: Boolean, default: true }
    },
    badges: [{
      badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
      earnedAt: { type: Date, default: Date.now }
    }],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
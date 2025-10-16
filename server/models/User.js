const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  profile: {
    age: Number,
    currency: { type: String, default: 'USD' },
    monthlyBudget: { type: Number, default: 0 },
    location: String,
    occupation: String
  },
  
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false },
    budgetAlerts: { type: Boolean, default: true }
  },
  
  badges: [userBadgeSchema],
  
  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  lastExpenseDate: { type: Date },
  
  // Statistics
  totalExpenses: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update streak when user logs in
userSchema.methods.updateLoginStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Format dates to compare only the date part (ignore time)
  const todayDate = today.toDateString();
  const lastLoginDate = this.lastLoginDate ? this.lastLoginDate.toDateString() : null;
  const yesterdayDate = yesterday.toDateString();
  
  if (!lastLoginDate) {
    // First login
    this.currentStreak = 1;
  } else if (lastLoginDate === yesterdayDate) {
    // Consecutive day
    this.currentStreak += 1;
  } else if (lastLoginDate !== todayDate) {
    // Broken streak
    this.currentStreak = 1;
  }
  
  // Update longest streak if current is higher
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastLoginDate = today;
  return this.currentStreak;
};

// Update expense streak
userSchema.methods.updateExpenseStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayDate = today.toDateString();
  const lastExpenseDate = this.lastExpenseDate ? this.lastExpenseDate.toDateString() : null;
  const yesterdayDate = yesterday.toDateString();
  
  if (!lastExpenseDate) {
    this.currentStreak = 1;
  } else if (lastExpenseDate === yesterdayDate) {
    this.currentStreak += 1;
  } else if (lastExpenseDate !== todayDate) {
    this.currentStreak = 1;
  }
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastExpenseDate = today;
  return this.currentStreak;
};

module.exports = mongoose.model('User', userSchema);
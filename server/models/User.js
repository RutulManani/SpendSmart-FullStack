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
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  if (!this.lastLoginDate) {
    // First login
    this.currentStreak = 1;
  } else {
    const lastLogin = new Date(this.lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLogin.getTime() === yesterday.getTime()) {
      // Consecutive day
      this.currentStreak += 1;
    } else if (lastLogin.getTime() !== today.getTime()) {
      // Broken streak (not today and not yesterday)
      this.currentStreak = 1;
    }
    // If lastLogin is today, streak remains the same
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
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  if (!this.lastExpenseDate) {
    // First expense
    this.currentStreak = 1;
  } else {
    const lastExpense = new Date(this.lastExpenseDate);
    lastExpense.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastExpense.getTime() === yesterday.getTime()) {
      // Consecutive day
      this.currentStreak += 1;
    } else if (lastExpense.getTime() !== today.getTime()) {
      // Broken streak (not today and not yesterday)
      this.currentStreak = 1;
    }
    // If lastExpense is today, streak remains the same
  }
  
  // Update longest streak if current is higher
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastExpenseDate = today;
  return this.currentStreak;
};

module.exports = mongoose.model('User', userSchema);
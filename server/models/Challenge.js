// server/models/Challenge.js
const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema(
  {
    // support both "title" and "name" (admin UI sends both)
    title: { type: String, trim: true },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    target: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Ensure at least one of title/name is present
ChallengeSchema.pre('validate', function (next) {
  if (!this.title && !this.name) {
    this.invalidate('title', 'Either title or name is required');
  }
  next();
});

ChallengeSchema.virtual('display').get(function () {
  return this.title || this.name || '(untitled)';
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
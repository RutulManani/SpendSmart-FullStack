// server/models/Badge.js
const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    points: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

BadgeSchema.pre('validate', function (next) {
  if (!this.name && !this.title) {
    this.invalidate('name', 'Either name or title is required');
  }
  next();
});

BadgeSchema.virtual('display').get(function () {
  return this.name || this.title || '(untitled)';
});

module.exports = mongoose.model('Badge', BadgeSchema);
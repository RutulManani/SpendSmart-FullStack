// server/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    // accept either "name" or "title" from client
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    // always expose a computed display field
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Ensure at least one of name/title is present
CategorySchema.pre('validate', function (next) {
  if (!this.name && !this.title) {
    this.invalidate('name', 'Either name or title is required');
  }
  next();
});

// A virtual for consistent display
CategorySchema.virtual('display').get(function () {
  return this.name || this.title || '(untitled)';
});

module.exports = mongoose.model('Category', CategorySchema);
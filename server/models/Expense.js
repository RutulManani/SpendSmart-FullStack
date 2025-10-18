const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    mood: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['happy', 'sad', 'stressed', 'bored', 'excited', 'angry', 'relaxed', 'neutral', 'other'],
      default: 'neutral',
    },
    category: { type: String, trim: true, default: 'other' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
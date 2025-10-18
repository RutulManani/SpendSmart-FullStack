const mongoose = require('mongoose');

const UserChallengeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserChallenge', UserChallengeSchema);
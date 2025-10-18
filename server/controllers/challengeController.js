const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');

exports.listChallenges = async (req, res) => {
  try {
    const query = {};
    if (Challenge.schema.path('isActive')) query.isActive = true;
    const challenges = await Challenge.find(query).sort({ createdAt: -1 });
    res.json({ challenges });
  } catch (e) {
    console.error('listChallenges error:', e);
    res.status(500).json({ error: 'Failed to load challenges' });
  }
};

exports.getActiveChallenge = async (req, res) => {
  try {
    const uc = await UserChallenge.findOne({
      userId: req.userId,
      endedAt: { $exists: false },
    })
      .sort({ startedAt: -1 })
      .populate('challengeId');

    res.json({ activeChallenge: uc || null });
  } catch (e) {
    console.error('getActiveChallenge error:', e);
    res.status(500).json({ error: 'Failed to load active challenge' });
  }
};

exports.startChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    if (!challengeId || !mongoose.isValidObjectId(challengeId)) {
      return res.status(400).json({ error: 'Invalid challengeId' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    await UserChallenge.updateMany(
      { userId: req.userId, endedAt: { $exists: false } },
      { $set: { endedAt: new Date(), status: 'completed' } }
    );

    const created = await UserChallenge.create({
      userId: req.userId,
      challengeId: challenge._id,
      startedAt: new Date(),
      progress: 0,
      status: 'active',
    });

    const populated = await created.populate('challengeId');
    res.status(201).json({ userChallenge: populated });
  } catch (e) {
    console.error('startChallenge error:', e);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
};

exports.endChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const uc = await UserChallenge.findOne({ _id: id, userId: req.userId });
    if (!uc) return res.status(404).json({ error: 'Active challenge not found' });

    uc.endedAt = new Date();
    uc.status = 'completed';
    await uc.save();

    res.json({ message: 'Challenge ended', userChallenge: uc });
  } catch (e) {
    console.error('endChallenge error:', e);
    res.status(500).json({ error: 'Failed to end challenge' });
  }
};

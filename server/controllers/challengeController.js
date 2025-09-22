const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const User = require('../models/User');

// Get all available challenges
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Error fetching challenges' });
  }
};

// Start a challenge
exports.startChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.userId;

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check for existing active challenge
    const existingActive = await UserChallenge.findOne({
      userId,
      status: 'active'
    });

    if (existingActive) {
      return res.status(400).json({ error: 'You already have an active challenge' });
    }

    // Create new user challenge
    const userChallenge = new UserChallenge({
      userId,
      challengeId,
      status: 'active',
      progress: 0
    });

    await userChallenge.save();

    // Set timeout to automatically end challenge after duration
    setTimeout(async () => {
      try {
        const uc = await UserChallenge.findById(userChallenge._id);
        if (uc && uc.status === 'active') {
          uc.status = uc.progress >= 100 ? 'completed' : 'failed';
          await uc.save();
        }
      } catch (err) {
        console.error('Auto-end challenge error:', err);
      }
    }, challenge.durationHours * 60 * 60 * 1000);

    res.status(201).json({
      message: 'Challenge started successfully',
      userChallenge,
      challenge
    });
  } catch (error) {
    console.error('Start challenge error:', error);
    res.status(500).json({ error: 'Error starting challenge' });
  }
};

// Get user's active challenge
exports.getActiveChallenge = async (req, res) => {
  try {
    const userId = req.userId;

    const activeChallenge = await UserChallenge.findOne({
      userId,
      status: 'active'
    }).populate('challengeId');

    if (!activeChallenge) {
      return res.json({ activeChallenge: null });
    }

    // Calculate time remaining
    const elapsedTime = Date.now() - new Date(activeChallenge.startedAt).getTime();
    const totalTime = activeChallenge.challengeId.durationHours * 60 * 60 * 1000;
    const timeRemaining = Math.max(0, totalTime - elapsedTime);

    res.json({
      activeChallenge,
      timeRemaining: Math.floor(timeRemaining / 1000) // in seconds
    });
  } catch (error) {
    console.error('Get active challenge error:', error);
    res.status(500).json({ error: 'Error fetching active challenge' });
  }
};

// End a challenge
exports.endChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.userId;

    const userChallenge = await UserChallenge.findOne({
      _id: challengeId,
      userId,
      status: 'active'
    });

    if (!userChallenge) {
      return res.status(404).json({ error: 'Active challenge not found' });
    }

    userChallenge.status = 'abandoned';
    userChallenge.completedAt = new Date();
    await userChallenge.save();

    res.json({
      message: 'Challenge ended',
      userChallenge
    });
  } catch (error) {
    console.error('End challenge error:', error);
    res.status(500).json({ error: 'Error ending challenge' });
  }
};

// Get user's challenge history
exports.getChallengeHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const history = await UserChallenge.find({ userId })
      .populate('challengeId')
      .sort({ startedAt: -1 });

    res.json({ history });
  } catch (error) {
    console.error('Get challenge history error:', error);
    res.status(500).json({ error: 'Error fetching challenge history' });
  }
};
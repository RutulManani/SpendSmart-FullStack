const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { updateLoginStreak } = require('./streakController');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const token = signToken(user);
    
    // Get user with populated badges
    const userWithBadges = await User.findById(user._id)
      .select('-password')
      .populate('badges.badgeId');

    res.json({
      token,
      user: { 
        _id: userWithBadges._id, 
        name: userWithBadges.name, 
        email: userWithBadges.email, 
        role: userWithBadges.role,
        currentStreak: userWithBadges.currentStreak,
        longestStreak: userWithBadges.longestStreak,
        badges: userWithBadges.badges
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    // Update login streak
    await updateLoginStreak(user._id);

    const token = signToken(user);
    
    // Get updated user data with populated badges
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('badges.badgeId');
    
    res.json({
      token,
      user: { 
        _id: updatedUser._id, 
        name: updatedUser.name, 
        email: updatedUser.email, 
        role: updatedUser.role,
        currentStreak: updatedUser.currentStreak,
        longestStreak: updatedUser.longestStreak,
        badges: updatedUser.badges
      },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('badges.badgeId');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badges: user.badges,
        createdAt: user.createdAt
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to load profile' });
  }
};
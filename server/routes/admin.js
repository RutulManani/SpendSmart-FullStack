const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Challenge = require('../models/Challenge');
const Category = require('../models/Category');
const Badge = require('../models/Badge');
const User = require('../models/User');

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalChallenges = await Challenge.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalBadges = await Badge.countDocuments();

    res.json({
      totalUsers,
      totalChallenges,
      totalCategories,
      totalBadges
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Challenge management
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json({ challenges });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching challenges' });
  }
});

router.post('/challenges', async (req, res) => {
  try {
    const challenge = new Challenge({
      ...req.body,
      createdBy: req.userId
    });
    await challenge.save();
    res.status(201).json({ challenge });
  } catch (error) {
    res.status(500).json({ error: 'Error creating challenge' });
  }
});

router.put('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ challenge });
  } catch (error) {
    res.status(500).json({ error: 'Error updating challenge' });
  }
});

router.delete('/challenges/:id', async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting challenge' });
  }
});

// Category management
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      createdBy: req.userId
    });
    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Error creating category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Error updating category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting category' });
  }
});

// Badge management
router.get('/badges', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json({ badges });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching badges' });
  }
});

router.post('/badges', async (req, res) => {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.status(201).json({ badge });
  } catch (error) {
    res.status(500).json({ error: 'Error creating badge' });
  }
});

router.put('/badges/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ badge });
  } catch (error) {
    res.status(500).json({ error: 'Error updating badge' });
  }
});

router.delete('/badges/:id', async (req, res) => {
  try {
    await Badge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Badge deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting badge' });
  }
});

module.exports = router;
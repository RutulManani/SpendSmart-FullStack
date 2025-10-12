// server/routes/admin.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

const Category = require('../models/Category');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const User = require('../models/User');

// Helper to send friendly errors
const sendError = (res, err, fallback = 'Request failed') => {
  const message =
    err?.message ||
    err?.errors?.[Object.keys(err.errors || {})[0]]?.message ||
    err?.response?.data?.error ||
    fallback;
  return res.status(400).json({ error: message });
};

// Dashboard stats
router.get('/stats', adminAuth, async (_req, res) => {
  try {
    const [totalUsers, totalChallenges, totalCategories, totalBadges] =
      await Promise.all([
        User.countDocuments(),
        Challenge.countDocuments(),
        Category.countDocuments(),
        Badge.countDocuments(),
      ]);
    res.json({ totalUsers, totalChallenges, totalCategories, totalBadges });
  } catch (err) {
    return sendError(res, err, 'Failed to fetch admin stats');
  }
});

/** ===================== Categories ===================== */
router.get('/categories', adminAuth, async (_req, res) => {
  try {
    const items = await Category.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    return sendError(res, err, 'Failed to load categories');
  }
});

router.post('/categories', adminAuth, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.userId,
    };
    // normalize: if name missing but title exists, keep as-is (model ensures one exists)
    const item = await Category.create(payload);
    res.json(item);
  } catch (err) {
    return sendError(res, err, 'Failed to create category');
  }
});

router.put('/categories/:id', adminAuth, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    return sendError(res, err, 'Failed to update category');
  }
});

router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 'Failed to delete category');
  }
});

/** ===================== Challenges ===================== */
router.get('/challenges', adminAuth, async (_req, res) => {
  try {
    const items = await Challenge.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    return sendError(res, err, 'Failed to load challenges');
  }
});

router.post('/challenges', adminAuth, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.userId,
    };

    // Try to coerce date strings if present
    if (payload.startDate && typeof payload.startDate === 'string') {
      const d = new Date(payload.startDate);
      if (!isNaN(d)) payload.startDate = d;
    }
    if (payload.endDate && typeof payload.endDate === 'string') {
      const d = new Date(payload.endDate);
      if (!isNaN(d)) payload.endDate = d;
    }

    const item = await Challenge.create(payload);
    res.json(item);
  } catch (err) {
    return sendError(res, err, 'Failed to create challenge');
  }
});

router.put('/challenges/:id', adminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.startDate && typeof payload.startDate === 'string') {
      const d = new Date(payload.startDate);
      if (!isNaN(d)) payload.startDate = d;
    }
    if (payload.endDate && typeof payload.endDate === 'string') {
      const d = new Date(payload.endDate);
      if (!isNaN(d)) payload.endDate = d;
    }

    const updated = await Challenge.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    return sendError(res, err, 'Failed to update challenge');
  }
});

router.delete('/challenges/:id', adminAuth, async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 'Failed to delete challenge');
  }
});

/** ===================== Badges ===================== */
router.get('/badges', adminAuth, async (_req, res) => {
  try {
    const items = await Badge.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    return sendError(res, err, 'Failed to load badges');
  }
});

router.post('/badges', adminAuth, async (req, res) => {
  try {
    const item = await Badge.create({ ...req.body, createdBy: req.userId });
    res.json(item);
  } catch (err) {
    return sendError(res, err, 'Failed to create badge');
  }
});

router.put('/badges/:id', adminAuth, async (req, res) => {
  try {
    const updated = await Badge.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    return sendError(res, err, 'Failed to update badge');
  }
});

router.delete('/badges/:id', adminAuth, async (req, res) => {
  try {
    await Badge.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    return sendError(res, err, 'Failed to delete badge');
  }
});

module.exports = router;
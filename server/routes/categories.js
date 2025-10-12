// server/routes/categories.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// User-facing list (auth required). If your schema has isActive, filter by it.
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (Category.schema.path('isActive')) query.isActive = true;
    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.json({ categories });
  } catch (e) {
    console.error('categories list error:', e);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

module.exports = router;
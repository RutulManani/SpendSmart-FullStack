// server/routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const axios = require('axios');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, age, currency, monthlyBudget, location, occupation, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (age !== undefined) updateData['profile.age'] = age;
    if (currency) updateData['profile.currency'] = currency;
    if (monthlyBudget !== undefined) updateData['profile.monthlyBudget'] = monthlyBudget;
    if (location !== undefined) updateData['profile.location'] = location;
    if (occupation !== undefined) updateData['profile.occupation'] = occupation;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully', 
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get exchange rates (external API)
router.get('/exchange-rates', auth, async (req, res) => {
  try {
    const { baseCurrency = 'USD' } = req.query;
    
    // Using a free exchange rate API
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    res.json({
      base: baseCurrency,
      rates: response.data.rates,
      lastUpdated: response.data.date
    });
  } catch (error) {
    console.error('Exchange rates error:', error);
    // Fallback rates in case API fails
    const fallbackRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.5,
      CAD: 1.25,
      AUD: 1.35,
      INR: 74.5,
      CNY: 6.45,
      BRL: 5.25,
      MXN: 20.15
    };
    
    res.json({
      base: 'USD',
      rates: fallbackRates,
      lastUpdated: new Date().toISOString().split('T')[0],
      note: 'Using fallback rates'
    });
  }
});

module.exports = router;
// server/routes/expenses.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

// Debug middleware for expenses routes
router.use((req, res, next) => {
  console.log(`Expenses route: ${req.method} ${req.path}`);
  next();
});

// User-facing (auth required)
router.post('/', auth, expenseController.createExpense);
router.get('/', auth, expenseController.listExpenses);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

// Debug route to check if expenses routes are working
router.get('/debug/test', auth, (req, res) => {
  res.json({ message: 'Expenses routes are working!', userId: req.userId });
});

module.exports = router;
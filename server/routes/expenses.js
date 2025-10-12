// server/routes/expenses.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/expenseController');

// User-facing (auth required)
router.post('/', auth, ctrl.createExpense);
router.get('/', auth, ctrl.listExpenses);

module.exports = router;
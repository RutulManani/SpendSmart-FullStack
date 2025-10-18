const Expense = require('../models/Expense');
const UserChallenge = require('../models/UserChallenge');
const { updateExpenseStreak } = require('./streakController');

const clamp100 = (n) => Math.max(0, Math.min(100, n));
const POSITIVE_MOODS = new Set(['happy', 'excited', 'relaxed']);

exports.createExpense = async (req, res) => {
  try {
    const { amount, mood, category, date } = req.body;

    if (amount == null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Normalize date - use provided date or current time
    let expenseDate = new Date();
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        expenseDate = parsed;
      }
    }

    console.log('Creating expense with category:', category); // Debug log

    // 1) Save the expense
    const expense = await Expense.create({
      userId: req.userId,
      amount: Number(amount),
      mood: (mood || 'neutral').toLowerCase(),
      category: (category || 'other').toLowerCase().trim(), // Ensure lowercase and trim
      date: expenseDate,
    });

    console.log('Expense created:', expense); // Debug log

    // 2) Update expense streak
    await updateExpenseStreak(req.userId);

    // 3) Update active challenge progress
    let updatedUserChallenge = null;
    const uc = await UserChallenge.findOne({
      userId: req.userId,
      endedAt: { $exists: false },
    }).sort({ startedAt: -1 });

    if (uc) {
      const delta = POSITIVE_MOODS.has((mood || '').toLowerCase()) ? 10 : -10;
      uc.progress = clamp100((uc.progress ?? 0) + delta);
      if (uc.progress >= 100) {
        uc.status = 'completed';
        uc.endedAt = new Date();
      }
      await uc.save();
      updatedUserChallenge = uc;
    }

    const obj = expense.toObject();
    // Ensure date is always available
    obj.date = obj.date || obj.createdAt;

    res.status(201).json({ expense: obj, userChallenge: updatedUserChallenge });
  } catch (e) {
    console.error('createExpense error:', e);
    res.status(500).json({ error: 'Failed to log expense' });
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    const docs = await Expense.find({ userId: req.userId })
      .sort({ date: -1, createdAt: -1 });

    console.log('Found expenses:', docs.length); // Debug log

    // Ensure each item includes a proper date
    const expenses = docs.map((d) => {
      const obj = d.toObject();
      obj.date = obj.date || obj.createdAt;
      console.log('Expense category:', obj.category); // Debug log
      return obj;
    });

    res.json({ expenses });
  } catch (e) {
    console.error('listExpenses error:', e);
    res.status(500).json({ error: 'Failed to load expenses' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, mood, category, date } = req.body;

    console.log('UPDATE EXPENSE - ID:', id);
    console.log('UPDATE EXPENSE - Body:', { amount, mood, category, date });

    // Validate amount
    if (amount == null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
      console.log('Expense not found or not owned by user:', id);
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Normalize date
    let expenseDate = expense.date;
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) expenseDate = parsed;
    }

    // Update expense
    expense.amount = Number(amount);
    expense.mood = (mood || 'neutral').toLowerCase();
    expense.category = (category || 'other').toLowerCase().trim(); // Ensure lowercase and trim
    expense.date = expenseDate;

    await expense.save();

    const updatedExpense = expense.toObject();
    updatedExpense.date = updatedExpense.date || updatedExpense.createdAt;

    console.log('Expense updated successfully:', updatedExpense);
    res.json({ expense: updatedExpense });
  } catch (e) {
    console.error('updateExpense error:', e);
    res.status(500).json({ error: 'Failed to update expense: ' + e.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('DELETE EXPENSE - ID:', id);

    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
      console.log('Expense not found or not owned by user:', id);
      return res.status(404).json({ error: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(id);

    console.log('Expense deleted successfully:', id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (e) {
    console.error('deleteExpense error:', e);
    res.status(500).json({ error: 'Failed to delete expense: ' + e.message });
  }
};
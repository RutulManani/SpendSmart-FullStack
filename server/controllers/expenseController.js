// server/controllers/expenseController.js
const Expense = require('../models/Expense');
const UserChallenge = require('../models/UserChallenge');

const clamp100 = (n) => Math.max(0, Math.min(100, n));
const POSITIVE_MOODS = new Set(['happy', 'excited', 'relaxed']);

exports.createExpense = async (req, res) => {
  try {
    const { amount, mood, category, date } = req.body;

    if (amount == null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Normalize date (optional from client); fallback to now
    let expenseDate = new Date();
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) expenseDate = parsed;
    }

    // 1) Save the expense
    const expense = await Expense.create({
      userId: req.userId,
      amount: Number(amount),
      mood: (mood || 'neutral').toLowerCase(),
      category: (category || 'other').toLowerCase(),
      date: expenseDate,
    });

    // 2) Update active challenge progress
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
    obj.date = obj.date || obj.createdAt; // ensure client always has a date

    res.status(201).json({ expense: obj, userChallenge: updatedUserChallenge });
  } catch (e) {
    console.error('createExpense error:', e);
    res.status(500).json({ error: 'Failed to log expense' });
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const docs = await Expense.find({ userId: req.userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);

    // Ensure each item includes a `date`
    const expenses = docs.map((d) => {
      const obj = d.toObject();
      obj.date = obj.date || obj.createdAt;
      return obj;
    });

    res.json({ expenses });
  } catch (e) {
    console.error('listExpenses error:', e);
    res.status(500).json({ error: 'Failed to load expenses' });
  }
};

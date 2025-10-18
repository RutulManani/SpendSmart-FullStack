// client/src/components/Dashboard/ExpenseForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ExpenseForm = ({ onExpenseAdded, hasActiveChallenge }) => {
  const [amount, setAmount] = useState('');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const moods = [
    'happy', 'sad', 'stressed', 'bored',
    'excited', 'angry', 'relaxed', 'neutral'
  ];

  // Helper: convert Date -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
  const toLocalInputValue = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  useEffect(() => {
    // default to "now" in the user's local time
    setDateTime(toLocalInputValue(new Date()));
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');

      const list = Array.isArray(res.data?.categories)
        ? res.data.categories
        : Array.isArray(res.data)
        ? res.data
        : [];

      setCategories(
        list.length
          ? list
          : [
              { _id: 'food', name: 'food' },
              { _id: 'entertainment', name: 'entertainment' },
              { _id: 'shopping', name: 'shopping' },
              { _id: 'other', name: 'other' },
            ]
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { _id: 'food', name: 'food' },
        { _id: 'entertainment', name: 'entertainment' },
        { _id: 'shopping', name: 'shopping' },
        { _id: 'other', name: 'other' },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasActiveChallenge) {
      alert('Please start a challenge first!');
      return;
    }
    if (!amount || !mood || !category || !dateTime) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Convert local datetime to ISO string for backend - FIXED timezone issue
      const localDate = new Date(dateTime);
      const isoDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();

      const response = await api.post('/expenses', {
        amount: parseFloat(amount),
        mood,
        category,
        date: isoDate,
      });

      onExpenseAdded(response.data.expense);

      setAmount('');
      setMood('');
      setCategory('');
      setDateTime(toLocalInputValue(new Date()));
      alert('Expense logged successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to log expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#2D2D2D] p-5 rounded-[10px] border border-[#444] flex-1">
      <div className="flex items-center gap-3 mb-5">
        <img src="/images/log-icon.png" alt="Expense Icon" className="w-6 h-6" />
        <h2 className="text-white font-semibold text-xl">Log Your Expense</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="amount" className="block mb-2 text-[#A9A9A9] text-sm">
          Amount Spent:
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border border-white bg-[#3D3D3D] text-[#E0E0E0] rounded mb-4"
          step="0.01"
          min="0"
          required
          disabled={loading}
        />

        <label htmlFor="mood" className="block mb-2 text-[#A9A9A9] text-sm">
          Mood:
        </label>
        <select
          id="mood"
          name="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full p-3 border border-white bg-[#3D3D3D] text-[#E0E0E0] rounded mb-4 appearance-none"
          required
          disabled={loading}
        >
          <option value="" disabled>Select Mood</option>
          {moods.map(m => (
            <option key={m} value={m}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>

        <label htmlFor="category" className="block mb-2 text-[#A9A9A9] text-sm">
          Category:
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 border border-white bg-[#3D3D3D] text-[#E0E0E0] rounded mb-4 appearance-none"
          required
          disabled={loading}
        >
          <option value="" disabled>Select Category</option>
          {categories.map(cat => (
            <option key={cat._id || cat.name} value={cat.name || cat.title}>
              {(cat.name || cat.title || '').charAt(0).toUpperCase() + (cat.name || cat.title || '').slice(1)}
            </option>
          ))}
        </select>

        {/* Date & Time */}
        <label htmlFor="dateTime" className="block mb-2 text-[#A9A9A9] text-sm">
          Date &amp; Time:
        </label>
        <input
          type="datetime-local"
          id="dateTime"
          name="dateTime"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full p-3 border border-white bg-[#3D3D3D] text-[#E0E0E0] rounded mb-4"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="w-full p-3 bg-[#B7FF00] text-[#181818] font-semibold rounded mt-2.5 hover:bg-[#a3e600] transition-colors disabled:opacity-50"
          disabled={loading || !hasActiveChallenge}
        >
          {loading ? 'Logging...' : 'Log Expense'}
        </button>

        {!hasActiveChallenge && (
          <p className="text-yellow-400 text-sm mt-2">
            Start a challenge first to log expenses!
          </p>
        )}
      </form>
    </section>
  );
};

export default ExpenseForm;
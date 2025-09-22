import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ExpenseForm = ({ onExpenseAdded, hasActiveChallenge }) => {
  const [amount, setAmount] = useState('');
  const [mood, setMood] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const moods = [
    'happy', 'sad', 'stressed', 'bored', 
    'excited', 'angry', 'relaxed', 'neutral'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      const expenseCategories = response.data.categories.filter(
        cat => cat.type === 'expense' && cat.isActive
      );
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories if API fails
      setCategories([
        { _id: '1', name: 'food' },
        { _id: '2', name: 'entertainment' },
        { _id: '3', name: 'shopping' },
        { _id: '4', name: 'other' }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasActiveChallenge) {
      alert('Please start a challenge first!');
      return;
    }

    if (!amount || !mood || !category) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/expenses', {
        amount: parseFloat(amount),
        mood,
        category
      });

      onExpenseAdded(response.data.expense);

      // Reset form
      setAmount('');
      setMood('');
      setCategory('');

      // Show success feedback
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
        <img src="/Images/Log Icon.png" alt="Expense Icon" className="w-6 h-6" />
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
            <option key={cat._id} value={cat.name}>
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </option>
          ))}
        </select>

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
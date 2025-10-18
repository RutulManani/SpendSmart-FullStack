import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../../services/api';

const SpendingHistory = ({ expenses, onExpenseUpdated, onExpenseDeleted }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch current categories from API
  useEffect(() => {
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
      
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'text-green-400',
      excited: 'text-green-400',
      relaxed: 'text-blue-400',
      neutral: 'text-gray-400',
      bored: 'text-yellow-400',
      sad: 'text-orange-400',
      stressed: 'text-red-400',
      angry: 'text-red-500'
    };
    return colors[mood] || 'text-gray-400';
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: '😊',
      excited: '🎉',
      relaxed: '😌',
      neutral: '😐',
      bored: '😑',
      sad: '😢',
      stressed: '😫',
      angry: '😠'
    };
    return icons[mood] || '📝';
  };

  const getDateObj = (expense) => {
    const raw = expense?.date || expense?.createdAt || expense?.updatedAt;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) ? d : null;
  };

  const formatDate = (expense) => {
    const d = getDateObj(expense);
    if (!d) return '-';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (expense) => {
    const d = getDateObj(expense);
    if (!d) return '-';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

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

  const moods = [
    'happy', 'sad', 'stressed', 'bored',
    'excited', 'angry', 'relaxed', 'neutral'
  ];

  const filteredExpenses = expenses
    .filter(expense => {
      if (filter === 'all') return true;
      return expense.category === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const da = getDateObj(a)?.getTime() || 0;
        const db = getDateObj(b)?.getTime() || 0;
        return db - da;
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });

  // Use categories from API instead of extracting from expenses
  const availableCategories = categories.map(cat => cat.name || cat.title).filter(Boolean);
  const totalSpent = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const averageSpent = expenses.length > 0 ? totalSpent / expenses.length : 0;

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      amount: expense.amount,
      mood: expense.mood,
      category: expense.category,
      dateTime: toLocalInputValue(getDateObj(expense) || new Date())
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (expenseId) => {
    if (!editForm.amount || !editForm.mood || !editForm.category || !editForm.dateTime) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const localDate = new Date(editForm.dateTime);
      const isoDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();

      console.log('Sending update request for expense:', expenseId);
      console.log('Update data:', {
        amount: parseFloat(editForm.amount),
        mood: editForm.mood,
        category: editForm.category,
        date: isoDate,
      });
      
      const response = await api.put(`/expenses/${expenseId}`, {
        amount: parseFloat(editForm.amount),
        mood: editForm.mood,
        category: editForm.category,
        date: isoDate,
      });

      console.log('Update response:', response);
      
      onExpenseUpdated(response.data.expense);
      setEditingId(null);
      setEditForm({});
      alert('Expense updated successfully!');
    } catch (error) {
      console.error('Update expense error:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.error || 'Failed to update expense. Please check the server console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Sending delete request for expense:', expenseId);
      
      await api.delete(`/expenses/${expenseId}`);
      
      console.log('Delete successful');
      onExpenseDeleted(expenseId);
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Delete expense error:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.error || 'Failed to delete expense. Please check the server console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#2D2D2D] p-5 rounded-[10px] border border-[#444]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src="/images/spending-insights.png" alt="History Icon" className="w-6 h-6" />
          <h2 className="text-white font-semibold text-xl">Spending History</h2>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 border border-[#B7FF00] text-[#B7FF00] rounded hover:bg-[#B7FF00] hover:text-[#181818] transition-colors"
        >
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#3D3D3D] p-4 rounded border border-[#444]">
          <p className="text-[#A9A9A9] text-sm">Total Expenses</p>
          <p className="text-white font-semibold text-xl">{expenses.length}</p>
        </div>
        <div className="bg-[#3D3D3D] p-4 rounded border border-[#444]">
          <p className="text-[#A9A9A9] text-sm">Total Spent</p>
          <p className="text-white font-semibold text-xl">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-[#3D3D3D] p-4 rounded border border-[#444]">
          <p className="text-[#A9A9A9] text-sm">Average/Expense</p>
          <p className="text-white font-semibold text-xl">${averageSpent.toFixed(2)}</p>
        </div>
      </div>

      {showHistory && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#A9A9A9]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#3D3D3D] border border-[#444] text-[#E0E0E0] rounded px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {String(category || '').charAt(0).toUpperCase() + String(category || '').slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#A9A9A9]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#3D3D3D] border border-[#444] text-[#E0E0E0] rounded px-3 py-2 text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-[#3D3D3D] rounded border border-[#444] overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[#A9A9A9]">No expenses found</p>
                <p className="text-[#A9A9A9] text-sm mt-1">
                  {expenses.length === 0 
                    ? "Start logging expenses to see your history here." 
                    : "No expenses match your current filter."
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredExpenses.map((expense, index) => (
                  <div
                    key={expense._id || index}
                    className={`p-4 border-b border-[#444] hover:bg-[#444] transition-colors ${
                      index % 2 === 0 ? 'bg-[#3D3D3D]' : 'bg-[#383838]'
                    }`}
                  >
                    {editingId === expense._id ? (
                      // Edit Form
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#A9A9A9] text-sm mb-1">Amount</label>
                            <input
                              type="number"
                              value={editForm.amount}
                              onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))}
                              className="w-full p-2 bg-[#2b2b2b] border border-[#444] text-white rounded"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A9A9A9] text-sm mb-1">Mood</label>
                            <select
                              value={editForm.mood}
                              onChange={(e) => setEditForm(f => ({ ...f, mood: e.target.value }))}
                              className="w-full p-2 bg-[#2b2b2b] border border-[#444] text-white rounded"
                            >
                              {moods.map(m => (
                                <option key={m} value={m}>
                                  {m.charAt(0).toUpperCase() + m.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#A9A9A9] text-sm mb-1">Category</label>
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                              className="w-full p-2 bg-[#2b2b2b] border border-[#444] text-white rounded"
                            >
                              <option value="">Select Category</option>
                              {availableCategories.map(cat => (
                                <option key={cat} value={cat}>
                                  {String(cat || '').charAt(0).toUpperCase() + String(cat || '').slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#A9A9A9] text-sm mb-1">Date & Time</label>
                            <input
                              type="datetime-local"
                              value={editForm.dateTime}
                              onChange={(e) => setEditForm(f => ({ ...f, dateTime: e.target.value }))}
                              className="w-full p-2 bg-[#2b2b2b] border border-[#444] text-white rounded"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveEdit(expense._id)}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 bg-[#B7FF00] text-[#181818] rounded hover:bg-[#a3e600] transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 bg-[#333] text-white rounded border border-[#555] hover:bg-[#444] transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getMoodIcon(expense.mood)}
                            </span>
                            <div>
                              <p className="text-white font-medium capitalize">
                                {expense.category}
                              </p>
                              <p className={`text-sm capitalize ${getMoodColor(expense.mood)}`}>
                                {expense.mood}
                              </p>
                            </div>
                          </div>
                          {expense.note && (
                            <p className="text-[#A9A9A9] text-sm mt-1">
                              {expense.note}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-semibold text-lg">
                            ${Number(expense.amount || 0).toFixed(2)}
                          </p>
                          <div className="text-[#A9A9A9] text-sm">
                            <p>{formatDate(expense)}</p>
                            <p>{formatTime(expense)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(expense)}
                            disabled={loading}
                            className="p-2 rounded bg-[#2b2b2b] border border-[#444] text-gray-200 hover:text-white transition-colors disabled:opacity-50"
                            title="Edit expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            disabled={loading}
                            className="p-2 rounded bg-[#2b2b2b] border border-[#444] text-red-300 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredExpenses.length > 0 && (
            <div className="bg-[#3D3D3D] p-4 rounded border border-[#444]">
              <div className="flex justify-between items-center">
                <span className="text-[#E0E0E0]">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </span>
                <span className="text-white font-semibold">
                  Total: ${filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SpendingHistory;
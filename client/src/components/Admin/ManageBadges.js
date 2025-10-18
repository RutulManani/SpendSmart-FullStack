// client/src/components/Admin/ManageBadges.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Save, X, Award } from 'lucide-react';

const displayName = (o) => o?.name || o?.title || o?.label || '(untitled)';
const normalize = (data) => (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.badges) ? data.badges : []);

export default function ManageBadges() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    points: '',
    criteriaType: 'custom',
    criteriaValue: '',
    rarity: 'common'
  });

  const fetchList = async () => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/admin/badges');
      console.log('Badges API Response:', data); // Debug log
      const normalizedItems = normalize(data);
      console.log('Normalized badges:', normalizedItems); // Debug log
      setItems(normalizedItems);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () => {
    setForm({ 
      name: '', 
      description: '', 
      points: '',
      criteriaType: 'custom',
      criteriaValue: '',
      rarity: 'common'
    });
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    const payload = {
      name: form.name,
      title: form.name,
      description: form.description || undefined,
      points: form.points ? Number(form.points) : undefined,
      rarity: form.rarity,
      criteria: {
        type: form.criteriaType,
        value: form.criteriaValue ? Number(form.criteriaValue) : 0,
        description: form.description || undefined
      }
    };

    try {
      let response;
      if (editingId) {
        response = await api.put(`/admin/badges/${editingId}`, payload);
        console.log('Update response:', response.data); // Debug log
        const updatedBadge = response.data.badge || response.data;
        setItems((prev) => prev.map((x) => (x._id === editingId ? updatedBadge : x)));
      } else {
        response = await api.post('/admin/badges', payload);
        console.log('Create response:', response.data); // Debug log
        const newBadge = response.data.badge || response.data;
        setItems((prev) => [newBadge, ...prev]);
      }
      resetForm();
    } catch (e) {
      console.error('Save error:', e); // Debug log
      setErr(e?.response?.data?.error || 'Save failed');
    }
  };

  const onEdit = (item) => {
    if (!item) return;
    
    setEditingId(item._id);
    setForm({
      name: item.name || item.title || '',
      description: item.description || '',
      points: item.points ?? '',
      criteriaType: item.criteria?.type || 'custom',
      criteriaValue: item.criteria?.value || '',
      rarity: item.rarity || 'common'
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this badge?')) return;
    try {
      await api.delete(`/admin/badges/${id}`);
      setItems((prev) => prev.filter((x) => x && x._id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Delete failed');
    }
  };

  // Safe rendering function
  const renderBadgeItem = (item, index) => {
    if (!item) {
      console.warn('Undefined badge item at index:', index);
      return null;
    }

    return (
      <li key={item._id || index} className="py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-white font-medium">{displayName(item)}</div>
            {item.description && (
              <div className="text-sm text-gray-400">{item.description}</div>
            )}
            <div className="text-xs text-gray-500">
              {item.criteria?.type && `Criteria: ${item.criteria.type}`}
              {item.criteria?.value && ` (${item.criteria.value})`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded bg-[#2b2b2b] border border-[#444] text-gray-200 hover:text-white"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-2 rounded bg-[#2b2b2b] border border-[#444] text-red-300 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-5">
        <h3 className="text-xl text-white font-semibold mb-4">Create / Edit Badge</h3>

        {err && <div className="text-red-400 mb-3">{err}</div>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Name *</span>
            <input
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Streak Master"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Points</span>
            <input
              type="number"
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.points}
              onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
              placeholder="e.g., 100"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Rarity</span>
            <select
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.rarity}
              onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value }))}
            >
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Criteria Type *</span>
            <select
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.criteriaType}
              onChange={(e) => setForm((f) => ({ ...f, criteriaType: e.target.value }))}
              required
            >
              <option value="custom">Custom</option>
              <option value="streak">Streak</option>
              <option value="challenges_completed">Challenges Completed</option>
              <option value="expenses_logged">Expenses Logged</option>
              <option value="savings">Savings</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Criteria Value</span>
            <input
              type="number"
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.criteriaValue}
              onChange={(e) => setForm((f) => ({ ...f, criteriaValue: e.target.value }))}
              placeholder="e.g., 7 (for 7-day streak)"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm text-gray-300">Description</span>
            <textarea
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Short description..."
            />
          </label>

          <div className="flex gap-3 items-center md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-lime-400/90 hover:bg-lime-400 text-black font-semibold px-4 py-2 rounded"
            >
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded border border-[#555]"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-5">
        <h3 className="text-xl text-white font-semibold mb-4">Badges</h3>

        {loading ? (
          <div className="text-gray-300">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">No badges yet.</div>
        ) : (
          <ul className="divide-y divide-[#333]">
            {items.filter(item => item).map(renderBadgeItem)}
          </ul>
        )}
      </div>
    </div>
  );
}
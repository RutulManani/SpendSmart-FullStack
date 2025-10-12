// client/src/components/Admin/ManageChallenges.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const displayName = (o) => o?.title || o?.name || o?.label || '(untitled)';
const normalize = (data) => (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);

export default function ManageChallenges() {
  const [items, setItems] = useState([]);         // list
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    target: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const fetchList = async () => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/admin/challenges');
      setItems(normalize(data));
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', target: '', startDate: '', endDate: '', isActive: true });
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    const payload = {
      // send both title & name to be compatible with either schema
      title: form.title,
      name: form.title,
      description: form.description,
      target: form.target ? Number(form.target) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      isActive: !!form.isActive,
    };

    try {
      if (editingId) {
        const { data } = await api.put(`/admin/challenges/${editingId}`, payload);
        setItems((prev) => prev.map((x) => (x._id === editingId ? data : x)));
      } else {
        const { data } = await api.post('/admin/challenges', payload);
        setItems((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Save failed');
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || item.name || '',
      description: item.description || '',
      target: item.target ?? '',
      startDate: item.startDate ? String(item.startDate).substring(0, 10) : '',
      endDate: item.endDate ? String(item.endDate).substring(0, 10) : '',
      isActive: item.isActive ?? true,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this challenge?')) return;
    try {
      await api.delete(`/admin/challenges/${id}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-5">
        <h3 className="text-xl text-white font-semibold mb-4">
          {editingId ? 'Edit Challenge' : 'Create Challenge'}
        </h3>

        {err && <div className="text-red-400 mb-3">{err}</div>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Title *</span>
            <input
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g., No-Spend Week"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Target (number)</span>
            <input
              type="number"
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.target}
              onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
              placeholder="e.g., 7"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm text-gray-300">Description</span>
            <textarea
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description..."
              rows={3}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Start Date</span>
            <input
              type="date"
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">End Date</span>
            <input
              type="date"
              className="bg-[#2b2b2b] border border-[#444] rounded px-3 py-2 text-white"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            <span className="text-sm text-gray-300">Active</span>
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

      {/* List */}
      <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-5">
        <h3 className="text-xl text-white font-semibold mb-4">Challenges</h3>

        {loading ? (
          <div className="text-gray-300">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">No challenges yet.</div>
        ) : (
          <ul className="divide-y divide-[#333]">
            {items.map((item) => (
              <li key={item._id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">{displayName(item)}</div>
                  {item.description && (
                    <div className="text-sm text-gray-400">{item.description}</div>
                  )}
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

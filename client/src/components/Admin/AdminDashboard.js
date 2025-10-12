import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Target, Tag, Award } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChallenges: 0,
    totalCategories: 0,
    totalBadges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (e) {
        console.error('Error fetching stats:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Total Challenges', value: stats.totalChallenges, icon: Target, color: 'text-green-400' },
    { label: 'Total Categories', value: stats.totalCategories, icon: Tag, color: 'text-yellow-400' },
    { label: 'Total Badges', value: stats.totalBadges, icon: Award, color: 'text-purple-400' },
  ];

  if (loading) return <div className="text-white">Loading dashboard…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#2D2D2D] rounded-lg p-6 border border-[#444]">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${color}`}>{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="mt-4 text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
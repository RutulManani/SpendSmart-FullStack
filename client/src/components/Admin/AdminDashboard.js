import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Target, Tag, Award } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChallenges: 0,
    totalCategories: 0,
    totalBadges: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Total Challenges', value: stats.totalChallenges, icon: Target, color: 'text-green-400' },
    { label: 'Total Categories', value: stats.totalCategories, icon: Tag, color: 'text-yellow-400' },
    { label: 'Total Badges', value: stats.totalBadges, icon: Award, color: 'text-purple-400' },
  ];

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#3D3D3D] p-6 rounded-lg border border-[#444]">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-3xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-[#A9A9A9] text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-[#3D3D3D] p-6 rounded-lg border border-[#444]">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <p className="text-[#E0E0E0]">• Navigate to different sections using the tabs above</p>
          <p className="text-[#E0E0E0]">• Manage challenges to keep users engaged</p>
          <p className="text-[#E0E0E0]">• Create new categories for better expense tracking</p>
          <p className="text-[#E0E0E0]">• Design badges to reward user achievements</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
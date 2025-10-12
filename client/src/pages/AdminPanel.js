// client/src/pages/AdminPanel.js
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ManageChallenges from '../components/Admin/ManageChallenges';
import ManageCategories from '../components/Admin/ManageCategories';
import ManageBadges from '../components/Admin/ManageBadges';
import { LayoutDashboard, Target, Tag, Award } from 'lucide-react';

const AdminPanel = () => {
  const location = useLocation();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'challenges', label: 'Challenges', icon: Target, path: '/admin/challenges' },
    { id: 'categories', label: 'Categories', icon: Tag, path: '/admin/categories' },
    { id: 'badges', label: 'Badges', icon: Award, path: '/admin/badges' },
  ];

  const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'dashboard';

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <div className="max-w-[1400px] mx-auto p-5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-[#A9A9A9]">Manage your SpendSmart application</p>
        </div>

        <div className="bg-[#2D2D2D] rounded-lg border border-[#444] mb-6 overflow-hidden">
          <div className="flex flex-wrap">
            {tabs.map(({ id, label, icon: Icon, path }) => {
              const isActive = id === activeTab;
              return (
                <Link
                  key={id}
                  to={path}
                  className={`flex items-center gap-2 px-6 py-4 transition-colors flex-1 min-w-[150px] justify-center ${
                    isActive ? 'bg-[#3D3D3D] text-white' : 'text-[#A9A9A9] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-[#2D2D2D] rounded-lg border border-[#444] p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="challenges" element={<ManageChallenges />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="badges" element={<ManageBadges />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
// client/src/components/Layout/Header.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, Menu, X, Award, Home, BarChart3 } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const items = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/challenges', label: 'Challenges', icon: Award },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <header className="bg-[#1E1E1E] border-b border-[#444] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img src="/images/logo.png" alt="SpendSmart Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {user && (
            <>
              <nav className="hidden md:flex space-x-8">
                {items.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'border-[#B7FF00] text-white'
                        : 'border-transparent text-[#A9A9A9] hover:text-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Link>
                ))}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors ${
                      isActive('/admin')
                        ? 'border-[#B7FF00] text-lime-300'
                        : 'border-transparent text-lime-300/80 hover:text-lime-300 hover:border-[#B7FF00]'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="text-white bg-[#2D2D2D] px-3 py-1 rounded-full border border-[#444] inline-flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.name || 'Profile'}</span>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute mt-12 right-8 bg-[#2D2D2D] border border-[#444] rounded-lg p-2">
                    <button
                      onClick={() => navigate('/settings')}
                      className="flex items-center gap-2 px-3 py-2 text-[#A9A9A9] hover:text-white"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-[#A9A9A9] hover:text-white"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-[#A9A9A9] hover:text-white">Login</Link>
              <Link to="/register" className="text-[#B7FF00]">Sign Up</Link>
            </div>
          )}

          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Calendar, DollarSign, MapPin, Briefcase, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [exchangeRates, setExchangeRates] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    currency: 'USD',
    monthlyBudget: '',
    location: '',
    occupation: '',
    preferences: {
      emailNotifications: true,
      weeklyReports: false,
      budgetAlerts: true
    }
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' }
  ];

  useEffect(() => {
    fetchProfile();
    fetchExchangeRates();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        age: userData.profile?.age || '',
        currency: userData.profile?.currency || 'USD',
        monthlyBudget: userData.profile?.monthlyBudget || '',
        location: userData.profile?.location || '',
        occupation: userData.profile?.occupation || '',
        preferences: userData.preferences || {
          emailNotifications: true,
          weeklyReports: false,
          budgetAlerts: true
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await api.get('/profile/exchange-rates');
      setExchangeRates(response.data);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear messages when user starts typing
    if (success) setSuccess('');
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/profile', formData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      
      // Update auth context if name changed
      if (response.data.user.name !== authUser.name) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#B7FF00] animate-spin mx-auto mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-[#A9A9A9]">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#2D2D2D] rounded-lg border border-[#444] p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A9A9A9] text-sm mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A9A9A9] text-sm mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                      <input
                        type="email"
                        value={formData.email}
                        className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-gray-400 border border-[#444] rounded-lg cursor-not-allowed"
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                    <p className="text-xs text-[#A9A9A9] mt-1">Email cannot be changed</p>
                  </div>
                </div>

                {/* Age and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A9A9A9] text-sm mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="13"
                        max="120"
                        className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                        placeholder="Your age"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A9A9A9] text-sm mb-2">Currency</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors appearance-none"
                      >
                        {currencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Monthly Budget */}
                <div>
                  <label className="block text-[#A9A9A9] text-sm mb-2">
                    Monthly Budget ({getCurrencySymbol(formData.currency)})
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                    <input
                      type="number"
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                      placeholder="Your monthly spending budget"
                    />
                  </div>
                </div>

                {/* Location and Occupation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A9A9A9] text-sm mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                        placeholder="Your city/country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A9A9A9] text-sm mb-2">Occupation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]" />
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                        placeholder="Your profession"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="preferences.emailNotifications"
                        checked={formData.preferences.emailNotifications}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#B7FF00] bg-[#3D3D3D] border-[#444] rounded focus:ring-[#B7FF00] focus:ring-2"
                      />
                      <span className="text-[#E0E0E0] text-sm">Email notifications</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="preferences.weeklyReports"
                        checked={formData.preferences.weeklyReports}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#B7FF00] bg-[#3D3D3D] border-[#444] rounded focus:ring-[#B7FF00] focus:ring-2"
                      />
                      <span className="text-[#E0E0E0] text-sm">Weekly spending reports</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="preferences.budgetAlerts"
                        checked={formData.preferences.budgetAlerts}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#B7FF00] bg-[#3D3D3D] border-[#444] rounded focus:ring-[#B7FF00] focus:ring-2"
                      />
                      <span className="text-[#E0E0E0] text-sm">Budget alerts</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 bg-[#B7FF00] text-[#181818] font-semibold rounded-lg hover:bg-[#a3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Exchange Rates */}
          <div className="lg:col-span-1">
            <div className="bg-[#2D2D2D] rounded-lg border border-[#444] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Exchange Rates</h3>
              
              {exchangeRates ? (
                <div className="space-y-3">
                  <div className="text-sm text-[#A9A9A9]">
                    Base: {exchangeRates.base}
                    {exchangeRates.note && (
                      <span className="text-yellow-400 text-xs block mt-1">{exchangeRates.note}</span>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.entries(exchangeRates.rates)
                      .filter(([currency]) => currency !== exchangeRates.base)
                      .slice(0, 8)
                      .map(([currency, rate]) => (
                        <div key={currency} className="flex justify-between items-center text-sm">
                          <span className="text-[#E0E0E0]">{currency}</span>
                          <span className="text-[#B7FF00] font-mono">
                            {typeof rate === 'number' ? rate.toFixed(4) : rate}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                  
                  <div className="text-xs text-[#A9A9A9] border-t border-[#444] pt-2">
                    Last updated: {exchangeRates.lastUpdated}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Loader className="w-6 h-6 text-[#B7FF00] animate-spin mx-auto mb-2" />
                  <p className="text-[#A9A9A9] text-sm">Loading exchange rates...</p>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-[#2D2D2D] rounded-lg border border-[#444] p-6 mt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A9A9A9]">Member since</span>
                  <span className="text-[#E0E0E0]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A9A9]">Role</span>
                  <span className="text-[#E0E0E0] capitalize">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A9A9]">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
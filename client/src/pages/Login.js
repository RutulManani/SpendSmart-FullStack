import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccess(true);
        setLoading(false);
        
        // Show success message for exactly 1 second, then redirect
        setTimeout(() => {
          const from = location.state?.from?.pathname || (result.user.role === 'admin' ? '/admin' : '/dashboard');
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setError(result.error || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-[#B7FF00]">Spend</span>Smart
          </h1>
          <p className="text-[#A9A9A9]">Welcome back! Please login to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#2D2D2D] rounded-lg border border-[#444] p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border-2 border-green-500 rounded-lg flex items-center gap-3 animate-pulse">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-semibold">🎉 Login Successful!</p>
                <p className="text-green-400 text-sm mt-1">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-[#A9A9A9] mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A9A9A9]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                  placeholder="your@email.com"
                  disabled={loading || success}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-[#A9A9A9] mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A9A9A9]" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-[#3D3D3D] text-white border border-[#444] rounded-lg focus:outline-none focus:border-[#B7FF00] transition-colors"
                  placeholder="••••••••"
                  disabled={loading || success}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#B7FF00] text-[#181818] font-semibold rounded-lg hover:bg-[#a3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Success! Redirecting...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#444]"></div>
            <span className="px-4 text-[#A9A9A9] text-sm">OR</span>
            <div className="flex-1 border-t border-[#444]"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-[#A9A9A9] text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#B7FF00] hover:underline font-semibold"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-[#A9A9A9] hover:text-[#B7FF00] text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
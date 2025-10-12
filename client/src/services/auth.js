import api from './api';

// Store token in localStorage
export const setToken = (token) => {
  try {
    localStorage.setItem('token', token);
    // Also set it in the api headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get token from localStorage
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove token from localStorage
export const removeToken = () => {
  try {
    localStorage.removeItem('token');
    // Also remove it from api headers
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Check if token is expired
    if (currentTime >= expirationTime) {
      removeToken();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    removeToken();
    return false;
  }
};

// Get user role from token
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Get user ID from token
export const getUserId = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    if (token) {
      setToken(token);
    }

    return { success: true, user };
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Login failed';
    return { success: false, error: errorMessage };
  }
};

// Register function
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;

    if (token) {
      setToken(token);
    }

    return { success: true, user };
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Registration failed';
    return { success: false, error: errorMessage };
  }
};

// Logout function
export const logout = () => {
  removeToken();
  // Optionally clear other user-related data from localStorage
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('userPreferences');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    if (!isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await api.get('/auth/me');
    return { success: true, user: response.data.user };
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to get user data';
    return { success: false, error: errorMessage };
  }
};

// Update user settings
export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/auth/settings', settings);
    return { success: true, settings: response.data.settings };
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to update settings';
    return { success: false, error: errorMessage };
  }
};

// Refresh token (if you implement token refresh logic)
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    const { token } = response.data;

    if (token) {
      setToken(token);
      return { success: true };
    }

    return { success: false, error: 'No token received' };
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to refresh token';
    return { success: false, error: errorMessage };
  }
};

// Verify token validity
export const verifyToken = async () => {
  try {
    if (!isAuthenticated()) {
      return false;
    }

    const response = await api.get('/auth/verify');
    return response.data.valid === true;
  } catch (error) {
    console.error('Token verification failed:', error);
    removeToken();
    return false;
  }
};

// Initialize auth (call this when app starts)
export const initializeAuth = () => {
  const token = getToken();
  if (token && isAuthenticated()) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  }
  return false;
};

export default {
  setToken,
  getToken,
  removeToken,
  isAuthenticated,
  getUserRole,
  getUserId,
  login,
  register,
  logout,
  getCurrentUser,
  updateSettings,
  refreshToken,
  verifyToken,
  initializeAuth
};

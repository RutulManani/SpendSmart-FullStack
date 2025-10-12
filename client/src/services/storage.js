// Local Storage utility functions for SpendSmart

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LAST_ACTIVE: 'lastActive',
  DRAFT_EXPENSE: 'draftExpense',
  CHALLENGE_STATE: 'challengeState'
};

// Generic storage functions
const storage = {
  // Set item in localStorage
  set: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  },

  // Get item from localStorage
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  has: (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage (${key}):`, error);
      return false;
    }
  }
};

// User-specific storage functions
export const userStorage = {
  // Save user data
  setUser: (userData) => {
    return storage.set(STORAGE_KEYS.USER, userData);
  },

  // Get user data
  getUser: () => {
    return storage.get(STORAGE_KEYS.USER);
  },

  // Remove user data
  removeUser: () => {
    return storage.remove(STORAGE_KEYS.USER);
  },

  // Update specific user field
  updateUserField: (field, value) => {
    const user = storage.get(STORAGE_KEYS.USER);
    if (user) {
      user[field] = value;
      return storage.set(STORAGE_KEYS.USER, user);
    }
    return false;
  }
};

// Preferences storage functions
export const preferencesStorage = {
  // Save user preferences
  setPreferences: (preferences) => {
    return storage.set(STORAGE_KEYS.PREFERENCES, preferences);
  },

  // Get user preferences
  getPreferences: (defaultPreferences = {}) => {
    return storage.get(STORAGE_KEYS.PREFERENCES, defaultPreferences);
  },

  // Update specific preference
  updatePreference: (key, value) => {
    const preferences = storage.get(STORAGE_KEYS.PREFERENCES, {});
    preferences[key] = value;
    return storage.set(STORAGE_KEYS.PREFERENCES, preferences);
  },

  // Remove preferences
  removePreferences: () => {
    return storage.remove(STORAGE_KEYS.PREFERENCES);
  }
};

// Theme storage functions
export const themeStorage = {
  // Set theme
  setTheme: (theme) => {
    return storage.set(STORAGE_KEYS.THEME, theme);
  },

  // Get theme
  getTheme: (defaultTheme = 'dark') => {
    return storage.get(STORAGE_KEYS.THEME, defaultTheme);
  },

  // Remove theme
  removeTheme: () => {
    return storage.remove(STORAGE_KEYS.THEME);
  }
};

// Draft expense storage (for auto-save functionality)
export const draftStorage = {
  // Save draft expense
  saveDraft: (expenseData) => {
    const draft = {
      ...expenseData,
      savedAt: new Date().toISOString()
    };
    return storage.set(STORAGE_KEYS.DRAFT_EXPENSE, draft);
  },

  // Get draft expense
  getDraft: () => {
    const draft = storage.get(STORAGE_KEYS.DRAFT_EXPENSE);
    if (!draft) return null;

    // Check if draft is older than 24 hours
    const savedAt = new Date(draft.savedAt);
    const now = new Date();
    const hoursDiff = (now - savedAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      storage.remove(STORAGE_KEYS.DRAFT_EXPENSE);
      return null;
    }

    return draft;
  },

  // Clear draft
  clearDraft: () => {
    return storage.remove(STORAGE_KEYS.DRAFT_EXPENSE);
  }
};

// Challenge state storage
export const challengeStorage = {
  // Save challenge state
  saveChallengeState: (state) => {
    return storage.set(STORAGE_KEYS.CHALLENGE_STATE, {
      ...state,
      savedAt: new Date().toISOString()
    });
  },

  // Get challenge state
  getChallengeState: () => {
    return storage.get(STORAGE_KEYS.CHALLENGE_STATE);
  },

  // Clear challenge state
  clearChallengeState: () => {
    return storage.remove(STORAGE_KEYS.CHALLENGE_STATE);
  }
};

// Last active timestamp
export const activityStorage = {
  // Set last active time
  setLastActive: () => {
    const timestamp = new Date().toISOString();
    return storage.set(STORAGE_KEYS.LAST_ACTIVE, timestamp);
  },

  // Get last active time
  getLastActive: () => {
    return storage.get(STORAGE_KEYS.LAST_ACTIVE);
  },

  // Check if session is stale (more than 30 minutes)
  isSessionStale: () => {
    const lastActive = storage.get(STORAGE_KEYS.LAST_ACTIVE);
    if (!lastActive) return true;

    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const minutesDiff = (now - lastActiveDate) / (1000 * 60);

    return minutesDiff > 30;
  }
};

// Clear all app data (except token for logout scenarios)
export const clearAppData = (keepToken = false) => {
  try {
    const token = keepToken ? storage.get(STORAGE_KEYS.TOKEN) : null;
    
    storage.clear();
    
    if (keepToken && token) {
      storage.set(STORAGE_KEYS.TOKEN, token);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
};

// Get storage size (approximate)
export const getStorageSize = () => {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    // Convert to KB
    return (totalSize / 1024).toFixed(2);
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

// Check if localStorage is available
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error('localStorage is not available:', error);
    return false;
  }
};

// Export storage keys for reference
export { STORAGE_KEYS };

// Export default storage object
export default storage;

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ADMIN_CHALLENGES: '/admin/challenges',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_BADGES: '/admin/badges',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Mood Options
export const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊', type: 'positive' },
  { value: 'excited', label: 'Excited', emoji: '🎉', type: 'positive' },
  { value: 'relaxed', label: 'Relaxed', emoji: '😌', type: 'positive' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', type: 'neutral' },
  { value: 'bored', label: 'Bored', emoji: '😑', type: 'negative' },
  { value: 'sad', label: 'Sad', emoji: '😢', type: 'negative' },
  { value: 'stressed', label: 'Stressed', emoji: '😰', type: 'negative' },
  { value: 'angry', label: 'Angry', emoji: '😠', type: 'negative' }
];

// Mood Points (for challenge progress)
export const MOOD_POINTS = {
  happy: 10,
  excited: 10,
  relaxed: 10,
  neutral: 5,
  bored: -5,
  sad: -10,
  stressed: -10,
  angry: -10
};

// Default Expense Categories
export const DEFAULT_CATEGORIES = [
  { value: 'food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#4ECDC4' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#95E1D3' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#F38181' },
  { value: 'bills', label: 'Bills', icon: '💡', color: '#AA96DA' },
  { value: 'health', label: 'Health', icon: '💊', color: '#FCBAD3' },
  { value: 'education', label: 'Education', icon: '📚', color: '#A8D8EA' },
  { value: 'other', label: 'Other', icon: '📦', color: '#FFFFD2' }
];

// Challenge Categories
export const CHALLENGE_CATEGORIES = {
  SPENDING: 'spending',
  SAVING: 'saving',
  TRACKING: 'tracking',
  MOOD: 'mood'
};

// Challenge Difficulties
export const CHALLENGE_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Badge Rarities
export const BADGE_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

// Badge Criteria Types
export const BADGE_CRITERIA_TYPES = {
  STREAK: 'streak',
  CHALLENGES_COMPLETED: 'challenges_completed',
  EXPENSES_LOGGED: 'expenses_logged',
  SAVINGS: 'savings',
  CUSTOM: 'custom'
};

// Currency Options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
];

// Default User Settings
export const DEFAULT_USER_SETTINGS = {
  currency: 'USD',
  monthlyBudget: 1000,
  emailReminders: true,
  reminderTime: '20:00'
};

// Time Durations (in hours)
export const CHALLENGE_DURATIONS = {
  DAILY: 24,
  WEEKLY: 168,
  MONTHLY: 720
};

// Progress Thresholds
export const PROGRESS_THRESHOLDS = {
  MIN: 0,
  MAX: 100,
  COMPLETION: 100
};

// Streak Milestones
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm'
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#B7FF00',
  SECONDARY: '#4CAF50',
  TERTIARY: '#81C784',
  BACKGROUND: '#2D2D2D',
  GRID: '#444',
  TEXT: '#E0E0E0'
};

// Expense Chart Colors (by category)
export const EXPENSE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#A8D8EA',
  '#FFFFD2'
];

// Toast/Notification Durations (in milliseconds)
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_NOTE_LENGTH: 500,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LAST_ACTIVE: 'lastActive',
  DRAFT_EXPENSE: 'draftExpense',
  CHALLENGE_STATE: 'challengeState'
};

// Session Configuration
export const SESSION_CONFIG = {
  TIMEOUT: 30, // minutes
  WARNING_TIME: 25 // minutes
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  REGISTER: 'Account created successfully!',
  EXPENSE_CREATED: 'Expense logged successfully!',
  EXPENSE_UPDATED: 'Expense updated successfully!',
  EXPENSE_DELETED: 'Expense deleted successfully!',
  CHALLENGE_STARTED: 'Challenge started successfully!',
  CHALLENGE_COMPLETED: 'Challenge completed! Keep up the great work!',
  SETTINGS_UPDATED: 'Settings updated successfully!',
  BADGE_EARNED: 'Congratulations! You earned a new badge!'
};

// Application Metadata
export const APP_METADATA = {
  NAME: 'SpendSmart',
  VERSION: '1.0.0',
  DESCRIPTION: 'Mood-aware expense tracking with gamification',
  AUTHOR: 'Rutul Manani',
  COURSE: 'HTTP 5310 - ONA - Capstone'
};

// Feature Flags (for enabling/disabling features)
export const FEATURE_FLAGS = {
  GOOGLE_AUTH: false,
  EMAIL_REMINDERS: true,
  EXPORT_CSV: true,
  DARK_MODE: true,
  LEADERBOARD: false,
  SOCIAL_SHARING: false,
  SENTIMENT_ANALYSIS: false
};

// Responsive Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  TOOLTIP: 1100,
  NOTIFICATION: 1200
};

// Export all as default object
export default {
  API_BASE_URL,
  ROUTES,
  USER_ROLES,
  MOODS,
  MOOD_POINTS,
  DEFAULT_CATEGORIES,
  CHALLENGE_CATEGORIES,
  CHALLENGE_DIFFICULTIES,
  BADGE_RARITIES,
  BADGE_CRITERIA_TYPES,
  CURRENCIES,
  DEFAULT_USER_SETTINGS,
  CHALLENGE_DURATIONS,
  PROGRESS_THRESHOLDS,
  STREAK_MILESTONES,
  PAGINATION,
  DATE_FORMATS,
  CHART_COLORS,
  EXPENSE_COLORS,
  NOTIFICATION_DURATION,
  VALIDATION,
  STORAGE_KEYS,
  SESSION_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_METADATA,
  FEATURE_FLAGS,
  BREAKPOINTS,
  ANIMATION_DURATION,
  Z_INDEX
};
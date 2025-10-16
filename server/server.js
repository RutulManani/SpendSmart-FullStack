// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();

// If you set cookies (JWT) from behind a proxy (Render), enable this:
app.set('trust proxy', 1);

/* =========================
   CORS — must be FIRST
   ========================= */
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://spend-smart-full-stack.vercel.app';

// exact origins (NO trailing slash)
const allowList = new Set([
  FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

// allow any Vercel preview for this project, with/without team slug:
// e.g. https://spend-smart-full-stack-abc123.vercel.app
//      https://spend-smart-full-stack-abc123-yourteam.vercel.app
const vercelPreview = /^https:\/\/spend-smart-full-stack[-a-z0-9]*\.(?:[a-z0-9-]+\.)?vercel\.app$/i;

const corsOptions = {
  origin(origin, cb) {
    // allow same-origin or non-browser tools (no Origin header)
    if (!origin) return cb(null, true);
    if (allowList.has(origin) || vercelPreview.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle OPTIONS preflight safely on Express 5 (regex instead of '*')
app.options(/.*/, cors(corsOptions)); // ✅ works with express@5

/* =========================
   Core middleware
   ========================= */
app.use(express.json({ limit: '10mb' }));

// Debug middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* =========================
   Routers
   ========================= */
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const challengesRoutes = require('./routes/challenges');
const categoriesRoutes = require('./routes/categories');
const expensesRoutes = require('./routes/expenses');
const profileRoutes = require('./routes/profile');
const badgeRoutes = require('./routes/badges');
const streakRoutes = require('./routes/streaks');

// Mount at /api/* (original)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/streaks', streakRoutes);

// Also mount without /api to match current frontend calls like /auth/login
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/challenges', challengesRoutes);
app.use('/categories', categoriesRoutes);
app.use('/expenses', expensesRoutes);
app.use('/profile', profileRoutes);
app.use('/badges', badgeRoutes);
app.use('/streaks', streakRoutes);

/* =========================
   Health & root
   ========================= */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'SpendSmart API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

/* =========================
   Debug: list routes
   ========================= */
app.get('/api/debug/routes', (_req, res) => {
  const routes = [];
  const collect = (layer, prefix = '') => {
    if (layer.route) {
      routes.push({ path: prefix + layer.route.path, methods: Object.keys(layer.route.methods) });
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach((l) => collect(l, prefix));
    }
  };
  app._router.stack.forEach((l) => collect(l));
  res.json({ routes });
});

/* =========================
   Ensure admin
   ========================= */
const User = require('./models/User');

async function ensureAdmin() {
  try {
    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@spendsmart.com').toLowerCase();
    const plain = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(plain, 10);

    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      await User.create({ name: 'Admin', email, password: hash, role: 'admin' });
      console.log(`✅ Admin created: ${email}`);
    } else {
      user.role = 'admin';
      user.password = hash;
      await user.save();
      console.log(`✅ Admin updated: ${email}`);
    }
  } catch (err) {
    console.error('❌ Admin setup error:', err.message);
  }
}

/* =========================
   DB connect & start
   ========================= */
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    if (process.env.NODE_ENV === 'production' || process.env.CREATE_ADMIN === 'true') {
      await ensureAdmin();
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
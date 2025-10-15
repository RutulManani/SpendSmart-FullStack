require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();

// Security and CORS configuration for production
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Debug middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const challengesRoutes = require('./routes/challenges');
const categoriesRoutes = require('./routes/categories');
const expensesRoutes = require('./routes/expenses');
const profileRoutes = require('./routes/profile');
const badgeRoutes = require('./routes/badges');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/badges', badgeRoutes);

// Health check endpoint (important for Render)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SpendSmart API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Debug route to check all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  function printRoutes(layer, prefix = '') {
    if (layer.route) {
      const path = prefix + layer.route.path;
      routes.push({
        path: path,
        methods: Object.keys(layer.route.methods)
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      const newPrefix = prefix + (layer.regexp.toString() !== '/^\\/?(?=\\/|$)/i' ? layer.regexp.toString().replace(/^\/\^\\\//, '').replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '') : '');
      layer.handle.stack.forEach((handler) => {
        printRoutes(handler, newPrefix);
      });
    }
  }

  app._router.stack.forEach((layer) => {
    printRoutes(layer);
  });
  
  res.json({ routes });
});

// Ensure admin exists
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
  } catch (error) {
    console.error('❌ Admin setup error:', error.message);
  }
}

// Database connection with better error handling
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Only create admin in production or if explicitly wanted
    if (process.env.NODE_ENV === 'production' || process.env.CREATE_ADMIN === 'true') {
      await ensureAdmin();
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Start server
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
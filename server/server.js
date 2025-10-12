// server/server.js
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
const authRoutes        = require('./routes/auth');
const adminRoutes       = require('./routes/admin');
const challengesRoutes  = require('./routes/challenges');
const categoriesRoutes  = require('./routes/categories');
const expensesRoutes    = require('./routes/expenses');  // <-- NEW

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);                // <-- MOUNTED

// Ensure admin exists
const User = require('./models/User');
async function ensureAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@spendsmart.com').toLowerCase();
  const plain = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const hash  = await bcrypt.hash(plain, 10);

  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    await User.create({ name: 'Admin', email, password: hash, role: 'admin' });
    console.log(`✅ Admin created: ${email} / ${plain}`);
  } else {
    user.role = 'admin';
    user.password = hash;
    await user.save();
    console.log(`✅ Admin password reset to: ${plain}`);
  }
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ MongoDB connected');
  await ensureAdmin();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}).catch(err => {
  console.error('❌ MongoDB error:', err.message);
  process.exit(1);
});

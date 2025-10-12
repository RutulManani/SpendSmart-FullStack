// server/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@spendsmart.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Admin',
        email,
        password: await bcrypt.hash(password, 10),
        role: 'admin',
      });
      console.log('✅ Admin created:', email);
    } else {
      user.role = 'admin';
      await user.save();
      console.log('✅ Existing user promoted to admin:', email);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

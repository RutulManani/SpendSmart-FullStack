const mongoose = require('mongoose');

let cached = global.__mongooseConn__;
if (!cached) {
  cached = global.__mongooseConn__ = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI in .env');

  mongoose.set('strictQuery', true);

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || 'spendsmart',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log(`✅ MongoDB connected: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('🛑 MongoDB disconnected');
  }
}

module.exports = { connectDB, disconnectDB };

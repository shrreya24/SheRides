const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] MongoDB connection error: ${error.message}`);
    console.error('[DB] Server will stay running — fix MONGO_URI or whitelist your IP in Atlas.');
    // Don't exit — let the server run so frontend loads, routes just won't persist data
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookloop';
    console.log(`Connecting to MongoDB at: ${connUri.includes('@') ? connUri.split('@')[1] : connUri}`);
    
    // Set connection options
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB Connection Notice: ${error.message}`);
    console.log('Operating with in-memory / local persistent JSON storage fallback if MongoDB is not reachable.');
    return null;
  }
};

module.exports = connectDB;

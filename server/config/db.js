import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
  console.log("🔄 Attempting to connect to MongoDB...");
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    
    if (retries > 0) {
      console.log(`🔄 Retrying connection... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      return connectDB(retries - 1);
    }
    
    console.error("❌ Could not connect to MongoDB after multiple attempts");
    console.error("⚠️  Server will start without database connection");
    console.error("📝 Please check:");
    console.error("   1. MongoDB Atlas is accessible");
    console.error("   2. Your IP address is whitelisted in MongoDB Atlas");
    console.error("   3. Your internet connection is working");
    console.error("   4. MONGO_URI in .env is correct");
    return false;
  }
};

export default connectDB;

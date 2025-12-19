import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const checkAllPoints = async () => {
  try {
    await connectDB();
    
    const allPoints = await Point.find({}).select('title lat lng category isPrivate status createdAt').sort({ createdAt: -1 }).limit(20);
    
    console.log(`\n📍 Last 20 points created:\n`);
    console.log('='.repeat(80));
    
    allPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point.title}`);
      console.log(`   Location: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      console.log(`   Category: ${point.category}`);
      console.log(`   Status: ${point.status} | Private: ${point.isPrivate}`);
      console.log(`   Created: ${point.createdAt}`);
      console.log('-'.repeat(80));
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkAllPoints();

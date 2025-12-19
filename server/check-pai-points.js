import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const checkPaiPoints = async () => {
  try {
    await connectDB();
    
    // Pai coordinates: approximately lng: 98.4, lat: 19.35
    const paiPoints = await Point.find({
      lat: { $gte: 18.5, $lte: 19.9 },
      lng: { $gte: 97.5, $lte: 99.5 }
    }).select('title lat lng category isPrivate status');
    
    console.log(`\n📍 Found ${paiPoints.length} points in Pai area\n`);
    console.log('='.repeat(80));
    
    paiPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point.title}`);
      console.log(`   Location: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      console.log(`   Category: ${point.category}`);
      console.log(`   Status: ${point.status} | Private: ${point.isPrivate}`);
      console.log('-'.repeat(80));
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkPaiPoints();

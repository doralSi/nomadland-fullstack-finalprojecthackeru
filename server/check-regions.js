import mongoose from 'mongoose';
import Region from './models/Region.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const checkRegions = async () => {
  try {
    await connectDB();
    
    const regions = await Region.find({}).select('name slug');
    
    console.log(`\n📍 Found ${regions.length} regions:\n`);
    console.log('='.repeat(80));
    
    regions.forEach((region, index) => {
      console.log(`${index + 1}. ${region.name}`);
      console.log(`   ID: ${region._id}`);
      console.log(`   Slug: ${region.slug}`);
      console.log('-'.repeat(80));
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkRegions();

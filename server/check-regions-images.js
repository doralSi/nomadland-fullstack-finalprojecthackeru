import mongoose from 'mongoose';
import Region from './models/Region.js';
import 'dotenv/config';

const checkRegions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nomadland');
    console.log('Connected to MongoDB\n');

    const regions = await Region.find({ isActive: true });
    console.log(`Found ${regions.length} active regions:\n`);

    regions.forEach((region, index) => {
      console.log(`Region ${index + 1}:`);
      console.log(`  Name: ${region.name}`);
      console.log(`  Slug: ${region.slug}`);
      console.log(`  Hero Image: ${region.heroImageUrl || 'NOT SET ❌'}`);
      console.log(`  Description: ${region.description ? 'Yes' : 'No'}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkRegions();

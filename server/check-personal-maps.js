import mongoose from 'mongoose';
import PersonalMap from './models/PersonalMap.js';
import 'dotenv/config';

const checkMaps = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nomadland');
    console.log('Connected to MongoDB\n');

    const maps = await PersonalMap.find().limit(5);
    console.log(`Found ${maps.length} personal maps:\n`);

    maps.forEach((map, index) => {
      console.log(`Map ${index + 1}:`);
      console.log(`  ID: ${map._id}`);
      console.log(`  Title: ${map.title}`);
      console.log(`  Description: ${map.description || '(none)'}`);
      console.log(`  Cover Image: ${map.coverImage || 'NOT SET ❌'}`);
      console.log(`  Points: ${map.pointIds.length}`);
      console.log(`  Created: ${map.createdAt}`);
      console.log('');
    });

    if (maps.length === 0) {
      console.log('No personal maps found in the database.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkMaps();

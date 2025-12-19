import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const fixPaiRegion = async () => {
  try {
    await connectDB();
    
    // Pai region ID
    const paiRegionId = '693f0ccf51e7a1d8eeb40450';
    
    // עדכן את כל הנקודות באזור פאי
    const result = await Point.updateMany(
      {
        lat: { $gte: 18.5, $lte: 19.9 },
        lng: { $gte: 97.5, $lte: 99.5 }
      },
      { 
        $set: { 
          region: paiRegionId,
          regionSlug: 'pai'
        } 
      }
    );
    console.log(`\n✅ Updated ${result.modifiedCount} points to region 'pai'\n`);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

fixPaiRegion();

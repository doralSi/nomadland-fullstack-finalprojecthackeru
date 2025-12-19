import mongoose from 'mongoose';
import PersonalMap from './models/PersonalMap.js';
import Point from './models/Point.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const deleteRecentMaps = async () => {
  try {
    await connectDB();
    
    // מצא נקודות שנוצרו ב-10 דקות האחרונות
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const recentPoints = await Point.find({ 
      createdAt: { $gte: tenMinutesAgo }
    });
    
    console.log(`\n🗑️  Found ${recentPoints.length} points created in the last 10 minutes\n`);
    
    if (recentPoints.length > 0) {
      console.log('Sample points:');
      recentPoints.slice(0, 5).forEach(p => {
        console.log(`  - ${p.title} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}) - ${p.createdAt}`);
      });
      
      // מחק את הנקודות
      const result = await Point.deleteMany({ 
        createdAt: { $gte: tenMinutesAgo }
      });
      console.log(`\n✅ Deleted ${result.deletedCount} recent points`);
    }
    
    // מחק את המפות של פאי שנוצרו לאחרונה
    const recentMaps = await PersonalMap.find({ 
      title: /פאי/,
      createdAt: { $gte: tenMinutesAgo }
    });
    
    console.log(`\n🗑️  Found ${recentMaps.length} maps to delete:\n`);
    
    for (const map of recentMaps) {
      console.log(`Map: ${map.title} - created at ${map.createdAt}`);
      
      // מחק את המפה
      await PersonalMap.deleteOne({ _id: map._id });
      console.log(`   Deleted map\n`);
    }
    
    console.log('✅ Done!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

deleteRecentMaps();

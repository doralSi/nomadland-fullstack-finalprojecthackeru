import mongoose from 'mongoose';
import fs from 'fs';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Point from './models/Point.js';
import PersonalMap from './models/PersonalMap.js';
import User from './models/User.js';

dotenv.config();

// Category mapping from KML styles to our system categories
// Pai categories mapping
const categoryMapping = {
  'בתי קפה': 'cafe',
  'מסעדות': 'restaurant',
  'מסעדות ': 'restaurant', // with trailing space
  'טבע, גינות, תצפיות ומסלולים': 'viewpoint',
  'משחקיה': 'kids',
  'מקדשים': 'religion',
  'שווקים': 'market',
  'מפלים ומעיינות': 'spring',
  'אטרקציות/בריכה/דברים לראות': 'pool',
  
  // Koh Phangan categories (legacy)
  'חופים': 'beach',
  'שווקים (בעיקר של אוכל)': 'market',
  'תצפיות ומסלולים': 'viewpoint',
  'מסעדות עם בריכה': 'restaurant',
  'שונות': 'culture',
  'מקומות לעבוד מהם': 'workspace',
  'מפלים': 'spring',
  'משחקיות': 'kids'
};

async function parseKML(filePath) {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const result = await parseStringPromise(xmlContent);
    return result;
  } catch (error) {
    console.error('Error parsing KML:', error);
    throw error;
  }
}

function extractCoordinates(coordString) {
  if (!coordString) return null;
  
  // Coordinates in KML are: longitude,latitude,altitude
  const parts = coordString.trim().split(',');
  if (parts.length < 2) return null;
  
  return {
    lng: parseFloat(parts[0]),
    lat: parseFloat(parts[1])
  };
}

function cleanDescription(description) {
  if (!description) return '';
  
  // Remove CDATA and HTML tags
  let cleaned = description.replace(/<!\[CDATA\[|\]\]>/g, '');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned.trim();
  
  return cleaned;
}

async function importKML(kmlFilePath, userId, mapTitle, mapDescription) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('📖 Reading KML file...');
    const kmlData = await parseKML(kmlFilePath);

    // Verify user exists
    console.log('👤 Verifying user...');
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    console.log(`✅ User found: ${user.username || user.email}`);

    // Create personal map
    console.log('🗺️  Creating personal map...');
    const personalMap = new PersonalMap({
      userId: userId,
      title: mapTitle || 'המלצות לקו פאנגן',
      description: mapDescription || 'המלצות אישיות מיובאות מ-Google My Maps',
      pointIds: []
    });

    const folders = kmlData.kml.Document[0].Folder || [];
    let totalPoints = 0;
    let successfulPoints = 0;
    let skippedPoints = 0;

    console.log(`\n📂 Found ${folders.length} categories\n`);

    for (const folder of folders) {
      const folderName = folder.name?.[0] || 'ללא קטגוריה';
      const category = categoryMapping[folderName] || 'Other';
      const placemarks = folder.Placemark || [];

      console.log(`\n📍 Processing category: ${folderName} (${placemarks.length} places)`);

      for (const placemark of placemarks) {
        totalPoints++;
        
        try {
          const name = placemark.name?.[0];
          const descriptionRaw = placemark.description?.[0];
          const description = cleanDescription(descriptionRaw);
          const coordString = placemark.Point?.[0]?.coordinates?.[0];
          
          if (!name) {
            console.log(`   ⚠️  Skipping placemark without name`);
            skippedPoints++;
            continue;
          }

          const coords = extractCoordinates(coordString);
          if (!coords) {
            console.log(`   ⚠️  Skipping ${name} - invalid coordinates`);
            skippedPoints++;
            continue;
          }

          // Create new point
          const point = new Point({
            title: name,
            description: description || `המלצה מ-${folderName}`,
            category: category,
            lat: coords.lat,
            lng: coords.lng,
            images: [],
            createdBy: userId,
            isPrivate: false, // Public points for main map
            language: 'he',
            status: 'approved'
          });

          await point.save();
          personalMap.pointIds.push(point._id);
          console.log(`   ✓ ${name}`);
          successfulPoints++;

        } catch (error) {
          console.error(`   ✗ Error processing placemark:`, error.message);
          skippedPoints++;
        }
      }
    }

    // Save the personal map
    await personalMap.save();

    console.log('\n' + '='.repeat(60));
    console.log('✨ Import Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total points in KML: ${totalPoints}`);
    console.log(`   Successfully imported: ${successfulPoints}`);
    console.log(`   Skipped: ${skippedPoints}`);
    console.log(`\n🗺️  Personal Map Created:`);
    console.log(`   ID: ${personalMap._id}`);
    console.log(`   Title: ${personalMap.title}`);
    console.log(`   Points: ${personalMap.pointIds.length}`);
    console.log('='.repeat(60));

    mongoose.connection.close();
    return personalMap;

  } catch (error) {
    console.error('❌ Error importing KML:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    throw error;
  }
}

// Usage example
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📖 Usage: node import-kml.js <kml-file-path> <user-id> [map-title] [map-description]');
  console.log('\nExample:');
  console.log('  node import-kml.js קופנגן.kml 507f1f77bcf86cd799439011 "קו פאנגן" "המלצות רותם לקו פאנגן"\n');
  process.exit(1);
}

const [kmlFilePath, userId, mapTitle, mapDescription] = args;

importKML(kmlFilePath, userId, mapTitle, mapDescription)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });

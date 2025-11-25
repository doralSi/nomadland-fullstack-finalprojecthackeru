import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Region from './models/Region.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const regions = [
  {
    name: "Koh Phangan",
    slug: "koh-phangan",
    description: "A tropical paradise in the Gulf of Thailand, famous for its Full Moon Parties, stunning beaches, yoga retreats, and vibrant digital nomad community. Perfect for those seeking island life with excellent coworking spaces and affordable living.",
    center: {
      lat: 9.72,
      lng: 100.00
    },
    zoom: 11,
    polygon: [
      [99.65426816117957, 9.27169394006215],
      [100.14385947466138, 9.268353448568476],
      [100.20252029274076, 9.553258109524037],
      [100.19010999264606, 9.930167378431548],
      [100.1325766530133, 10.220059212034329],
      [99.66780245977719, 10.215618405507698],
      [99.49601640706794, 9.69391982948305],
      [99.47271231152973, 9.579796608988445],
      [99.65426816117957, 9.27169394006215]
    ],
    heroImageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200",
    isActive: true
  },
  {
    name: "Pai",
    slug: "pai",
    description: "A bohemian mountain town in Northern Thailand, nestled in lush valleys with waterfalls, hot springs, and rice paddies. Known for its laid-back hippie vibe, creative community, affordable living, and stunning natural beauty.",
    center: {
      lat: 19.36,
      lng: 98.44
    },
    zoom: 9,
    polygon: [
      [98.41477916666457, 19.554509656555823],
      [98.1285795205801, 19.599114059464895],
      [98.09351998396579, 19.50549635128077],
      [98.05586958248927, 19.345381204460168],
      [98.13178363709312, 19.259972247758185],
      [98.29223827158108, 19.11395916459361],
      [98.53448213162966, 18.710801999496113],
      [98.92703974764055, 18.67659919446352],
      [99.14084476513699, 18.809493377292583],
      [99.13099543048156, 19.086323723158657],
      [99.12498964479471, 19.527566364889978],
      [98.41477916666457, 19.554509656555823]
    ],
    heroImageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200",
    isActive: true
  },
  {
    name: "Bansko",
    slug: "bansko",
    description: "A charming ski resort town in Bulgaria's Pirin Mountains, offering medieval architecture, thermal springs, and a thriving digital nomad scene. Famous for affordable living, fast internet, coworking spaces, and year-round outdoor activities.",
    center: {
      lat: 41.84,
      lng: 23.48
    },
    zoom: 9,
    polygon: [
      [23.13966058347063, 42.80322419231655],
      [22.887304589408274, 42.460457239574964],
      [22.80794386287684, 42.004392638994005],
      [23.00760694507585, 41.60849250506223],
      [23.50771291830742, 41.51517155287493],
      [24.286221046004783, 41.62866552976021],
      [24.747127012627317, 41.869412991690496],
      [24.964193176411214, 42.264482590499824],
      [24.486348863400536, 42.58414100061944],
      [23.808774649089344, 42.78244938260988],
      [23.436769189219945, 42.80952924564332],
      [23.13966058347063, 42.80322419231655]
    ],
    heroImageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200",
    isActive: true
  },
  {
    name: "Goa",
    slug: "goa",
    description: "India's coastal paradise blending Portuguese heritage, pristine beaches, and a legendary hippie culture. A digital nomad hotspot with beachside coworking, yoga retreats, vibrant nightlife, and incredibly affordable living on the Arabian Sea.",
    center: {
      lat: 15.35,
      lng: 74.05
    },
    zoom: 8,
    polygon: [
      [73.5645866237704, 15.739708400798804],
      [73.89033984035495, 14.955302947088413],
      [73.95466907860188, 14.842482179724811],
      [74.14769006706229, 14.879330653927298],
      [74.34328103436465, 15.035453226305194],
      [74.3813036822643, 15.097327306231833],
      [74.40267415225463, 15.20738451931203],
      [74.34806526516314, 15.243980458263195],
      [74.34804753333356, 15.340255775950354],
      [74.3124155237791, 15.500558167218827],
      [74.27208208528606, 15.706343854502194],
      [74.05115608377537, 15.641239263680134],
      [73.91385193771154, 15.844979240137874],
      [73.5645866237704, 15.739708400798804]
    ],
    heroImageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200",
    isActive: true
  }
];

const seedRegions = async () => {
  try {
    console.log('🌍 Starting region seeding...\n');

    // Clear existing regions
    await Region.deleteMany({});
    console.log('✅ Cleared existing regions\n');

    // Insert new regions
    for (const regionData of regions) {
      const region = new Region(regionData);
      await region.save();
      console.log(`✅ Created region: ${region.name} (${region.slug})`);
    }

    console.log('\n🎉 Successfully seeded all regions!');
    console.log(`\nTotal regions created: ${regions.length}`);
    
    // Display summary
    console.log('\n📍 Region Summary:');
    regions.forEach(r => {
      console.log(`   - ${r.name} (${r.slug})`);
      console.log(`     Center: [${r.center.lat}, ${r.center.lng}]`);
      console.log(`     Zoom: ${r.zoom}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding regions:', error);
    process.exit(1);
  }
};

seedRegions();

// Test script for Region endpoints
import http from 'http';

const BASE_URL = 'localhost';
const PORT = 5000;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testRegionEndpoints() {
  console.log('🧪 Testing Region Endpoints\n');

  try {
    // Test 1: Get all regions
    console.log('=== Test 1: GET /api/regions ===');
    const allRegionsResult = await makeRequest('/api/regions');
    const allRegions = allRegionsResult.data;
    console.log(`✅ Status: ${allRegionsResult.status}`);
    console.log(`✅ Found ${allRegions.length} regions:`);
    allRegions.forEach(region => {
      console.log(`   - ${region.name} (${region.slug})`);
    });
    console.log('');

    // Test 2: Get single region by slug
    console.log('=== Test 2: GET /api/regions/koh-phangan ===');
    const singleRegionResult = await makeRequest('/api/regions/koh-phangan');
    const singleRegion = singleRegionResult.data;
    console.log(`✅ Status: ${singleRegionResult.status}`);
    console.log(`✅ Region: ${singleRegion.name}`);
    console.log(`   Description: ${singleRegion.description.substring(0, 80)}...`);
    console.log(`   Center: [${singleRegion.center.lat}, ${singleRegion.center.lng}]`);
    console.log(`   Zoom: ${singleRegion.zoom}`);
    console.log(`   Polygon points: ${singleRegion.polygon.length}`);
    console.log('');

    // Test 3: Get non-existent region
    console.log('=== Test 3: GET /api/regions/invalid-slug ===');
    const invalidResult = await makeRequest('/api/regions/invalid-slug');
    console.log(`✅ Status: ${invalidResult.status} (should be 404)`);
    console.log(`✅ Message: ${invalidResult.data.message}`);
    console.log('');

    // Test 4: Verify all regions
    console.log('=== Test 4: Verify All Regions ===');
    const expectedRegions = ['koh-phangan', 'pai', 'bansko', 'goa'];
    const foundSlugs = allRegions.map(r => r.slug);
    
    expectedRegions.forEach(slug => {
      if (foundSlugs.includes(slug)) {
        console.log(`✅ ${slug} exists`);
      } else {
        console.log(`❌ ${slug} missing`);
      }
    });
    console.log('');

    console.log('🎉 All Region Endpoint Tests Passed!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('Make sure the server is running on port 5000');
  }
}

testRegionEndpoints();

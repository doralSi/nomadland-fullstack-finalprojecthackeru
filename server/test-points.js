// Test variables
let user1Token, user2Token, user1Id, user2Id, pointId;

const API_URL = 'http://localhost:5000/api';

// Helper function to make requests
async function request(method, endpoint, token = null, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log('🧪 Starting Point Tests...\n');

  try {
    // Step 0: Register two users
    console.log('📝 Registering User 1...');
    const reg1 = await request('POST', '/auth/register', null, {
      name: 'testuser1_' + Date.now(),
      email: `user1_${Date.now()}@test.com`,
      password: 'password123'
    });
    user1Token = reg1.data.token;
    user1Id = reg1.data.user.id;
    console.log(`✅ User 1 registered: ${reg1.data.user.name}`);
    console.log(`   Token: ${user1Token}\n`);

    console.log('📝 Registering User 2...');
    const reg2 = await request('POST', '/auth/register', null, {
      name: 'testuser2_' + Date.now(),
      email: `user2_${Date.now()}@test.com`,
      password: 'password123'
    });
    user2Token = reg2.data.token;
    user2Id = reg2.data.user.id;
    console.log(`✅ User 2 registered: ${reg2.data.user.name}`);
    console.log(`   Token: ${user2Token}\n`);

    // A: Create point (authorized)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST A: Create point (authorized)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const createResult = await request('POST', '/points', user1Token, {
      title: 'Amazing Beach Spot',
      description: 'Beautiful location for sunset',
      category: 'beach',
      lat: 32.0853,
      lng: 34.7818
    });
    console.log(`Status: ${createResult.status}`);
    console.log('Response:', JSON.stringify(createResult.data, null, 2));
    
    if (createResult.status === 201) {
      pointId = createResult.data._id;
      console.log(`✅ Point created successfully! ID: ${pointId}\n`);
    } else {
      console.log('❌ Failed to create point\n');
      return;
    }

    // B: Get all points
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST B: Get all points');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const getAllResult = await request('GET', '/points');
    console.log(`Status: ${getAllResult.status}`);
    console.log(`Points count: ${getAllResult.data.length}`);
    console.log('Response:', JSON.stringify(getAllResult.data, null, 2));
    console.log(getAllResult.status === 200 ? '✅ Successfully fetched all points\n' : '❌ Failed to fetch points\n');

    // C: Update point (with wrong user) → expect 403
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST C: Update point (with wrong user - expect 403)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const wrongUserUpdate = await request('PUT', `/points/${pointId}`, user2Token, {
      title: 'Hacked Title'
    });
    console.log(`Status: ${wrongUserUpdate.status}`);
    console.log('Response:', JSON.stringify(wrongUserUpdate.data, null, 2));
    console.log(wrongUserUpdate.status === 403 ? '✅ Correctly denied access (403)\n' : '❌ Should have returned 403\n');

    // D: Update point (with owner) → expect 200
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST D: Update point (with owner - expect 200)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const ownerUpdate = await request('PUT', `/points/${pointId}`, user1Token, {
      title: 'Updated Beach Spot',
      description: 'Even more beautiful now!'
    });
    console.log(`Status: ${ownerUpdate.status}`);
    console.log('Response:', JSON.stringify(ownerUpdate.data, null, 2));
    console.log(ownerUpdate.status === 200 ? '✅ Successfully updated by owner\n' : '❌ Failed to update\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All tests completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();

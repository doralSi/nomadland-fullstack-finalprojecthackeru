import axios from 'axios';

const testAPI = async () => {
  try {
    // You need to replace this token with a real user token from your app
    const token = 'YOUR_AUTH_TOKEN_HERE';
    
    const response = await axios.get('http://localhost:5000/api/personal-maps/regions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.regions) {
      console.log('\nChecking heroImageUrl for each region:');
      response.data.regions.forEach(region => {
        console.log(`${region.name}: ${region.heroImageUrl ? '✓ Has image' : '✗ NO IMAGE'}`);
        if (region.heroImageUrl) {
          console.log(`  URL: ${region.heroImageUrl}`);
        }
      });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

console.log('To test the API:');
console.log('1. Make sure server is running (npm start)');
console.log('2. Log in to the app and get your auth token from browser dev tools');
console.log('3. Replace YOUR_AUTH_TOKEN_HERE in this file with your token');
console.log('4. Run: node test-personal-maps-api.js\n');

// testAPI();

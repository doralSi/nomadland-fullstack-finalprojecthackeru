import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

async function quickTest() {
  try {
    console.log("Testing upload route availability...");
    
    // Test 1: Register a user
    const timestamp = Date.now();
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: "Quick Test User",
      email: `quicktest${timestamp}@example.com`,
      password: "Test123!"
    });
    
    console.log("User registered:", registerRes.data.user.email);
    
    // Test 2: Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: `quicktest${timestamp}@example.com`,
      password: "Test123!"
    });
    
    const token = loginRes.data.token;
    console.log("Login successful, token obtained");
    
    // Test 3: Check if upload route responds (even without actual image)
    try {
      const uploadRes = await axios.post(
        `${BASE_URL}/upload/image`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Upload route response:", uploadRes.data);
    } catch (uploadErr) {
      if (uploadErr.response) {
        console.log("Upload route is accessible");
        console.log("Status:", uploadErr.response.status);
        console.log("Message:", uploadErr.response.data);
      } else {
        console.log("Upload route error:", uploadErr.message);
      }
    }
    
  } catch (error) {
    console.error("Test failed:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
  }
}

quickTest();

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api";

// Test credentials - will create a new user for testing
const TEST_USER = {
  name: "Test Upload User",
  email: `testupload${Date.now()}@example.com`,
  password: "Test123!",
};

let authToken = "";
let uploadedImageUrl = "";
let createdPointId = "";

// Generate a simple test image (1x1 transparent PNG)
function generateTestImage() {
  // Base64 of a 1x1 transparent PNG
  const base64Image =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  return Buffer.from(base64Image, "base64");
}

async function login() {
  console.log("\n=== Step 1: Register and Login ===");
  try {
    // First register the user
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    console.log("✅ User registered successfully");
    console.log(`Email: ${registerResponse.data.user.email}`);
    
    // Now login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    authToken = loginResponse.data.token;
    console.log("✅ Login successful");
    console.log(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error("❌ Register/Login failed:", error.response?.data || error.message);
    return false;
  }
}

async function uploadImage() {
  console.log("\n=== Step 2: Upload Test Image ===");
  try {
    const imageBuffer = generateTestImage();
    const testImagePath = path.join(__dirname, "test-image.png");
    
    // Write the buffer to a temporary file
    fs.writeFileSync(testImagePath, imageBuffer);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath));

    const response = await axios.post(
      `${BASE_URL}/upload/image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    uploadedImageUrl = response.data.imageUrl;
    console.log("✅ Image uploaded successfully");
    console.log(`Image URL: ${uploadedImageUrl}`);

    // Clean up temporary file
    fs.unlinkSync(testImagePath);
    return true;
  } catch (error) {
    console.error("❌ Image upload failed:", error.response?.data || error.message);
    return false;
  }
}

async function createPointWithImage() {
  console.log("\n=== Step 3: Create Point with Image ===");
  try {
    const pointData = {
      title: "Test Point with Image",
      description: "This point includes an uploaded image",
      category: "test",
      lat: 32.0853,
      lng: 34.7818,
      images: [uploadedImageUrl],
    };

    const response = await axios.post(`${BASE_URL}/points`, pointData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    createdPointId = response.data._id;
    console.log("✅ Point created successfully");
    console.log(`Point ID: ${createdPointId}`);
    console.log(`Point Title: ${response.data.title}`);
    console.log(`Number of images: ${response.data.images.length}`);
    console.log(`Image URL in point: ${response.data.images[0]}`);
    return true;
  } catch (error) {
    console.error("❌ Point creation failed:", error.response?.data || error.message);
    return false;
  }
}

async function fetchPointAndVerifyImage() {
  console.log("\n=== Step 4: Fetch Point and Verify Image ===");
  try {
    const response = await axios.get(`${BASE_URL}/points/${createdPointId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const point = response.data;
    console.log("✅ Point fetched successfully");
    console.log(`Point Title: ${point.title}`);
    console.log(`Number of images: ${point.images.length}`);
    
    if (point.images.length > 0 && point.images[0] === uploadedImageUrl) {
      console.log("✅ Image verified in point.images[]");
      console.log(`Image URL matches: ${point.images[0]}`);
      return true;
    } else {
      console.error("❌ Image not found or doesn't match in point.images[]");
      return false;
    }
  } catch (error) {
    console.error("❌ Point fetch failed:", error.response?.data || error.message);
    return false;
  }
}

async function uploadSecondImageAndUpdate() {
  console.log("\n=== Step 5: Upload Second Image and Update Point ===");
  try {
    // Upload second image
    const imageBuffer = generateTestImage();
    const testImagePath = path.join(__dirname, "test-image-2.png");
    
    fs.writeFileSync(testImagePath, imageBuffer);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(
      `${BASE_URL}/upload/image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const secondImageUrl = uploadResponse.data.imageUrl;
    console.log("✅ Second image uploaded successfully");
    console.log(`Second Image URL: ${secondImageUrl}`);

    // Update point with both images
    const updateData = {
      images: [uploadedImageUrl, secondImageUrl],
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/points/${createdPointId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log("✅ Point updated with second image");
    console.log(`Total images now: ${updateResponse.data.images.length}`);
    console.log(`First image: ${updateResponse.data.images[0]}`);
    console.log(`Second image: ${updateResponse.data.images[1]}`);

    // Clean up temporary file
    fs.unlinkSync(testImagePath);

    if (updateResponse.data.images.length === 2) {
      console.log("✅ Multiple images support verified");
      return true;
    } else {
      console.error("❌ Multiple images not working correctly");
      return false;
    }
  } catch (error) {
    console.error("❌ Second image upload/update failed:", error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Starting Image Upload Tests...\n");
  console.log("Make sure the server is running on http://localhost:5000");

  let allPassed = true;

  // Step A: Login
  if (!(await login())) {
    allPassed = false;
    return;
  }

  // Step B: Upload image
  if (!(await uploadImage())) {
    allPassed = false;
    return;
  }

  // Step C: Create point with image
  if (!(await createPointWithImage())) {
    allPassed = false;
    return;
  }

  // Step D: Fetch and verify
  if (!(await fetchPointAndVerifyImage())) {
    allPassed = false;
    return;
  }

  // Step E: Upload second image and update
  if (!(await uploadSecondImageAndUpdate())) {
    allPassed = false;
    return;
  }

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED!");
    console.log("✅ Image upload working");
    console.log("✅ Point creation with images working");
    console.log("✅ Point fetch and verification working");
    console.log("✅ Multiple images support working");
  } else {
    console.log("❌ SOME TESTS FAILED");
  }
  console.log("=".repeat(50));
}

runTests().catch(console.error);

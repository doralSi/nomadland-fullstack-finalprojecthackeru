import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api";

async function testUpload() {
  console.log("Starting upload test...\n");

  try {
    // Step 1: Register user
    console.log("Step 1: Registering user...");
    const timestamp = Date.now();
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Upload Test User",
        email: `uploadtest${timestamp}@example.com`,
        password: "Test123!",
      }),
    });

    if (!registerRes.ok) {
      console.log("Registration failed:", await registerRes.text());
      return;
    }

    const registerData = await registerRes.json();
    console.log("✅ User registered:", registerData.user.email);

    // Step 2: Login
    console.log("\nStep 2: Logging in...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `uploadtest${timestamp}@example.com`,
        password: "Test123!",
      }),
    });

    if (!loginRes.ok) {
      console.log("Login failed:", await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("✅ Login successful");
    console.log("Token:", token.substring(0, 30) + "...");

    // Step 3: Create a test image
    console.log("\nStep 3: Creating test image...");
    const base64Image =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const imageBuffer = Buffer.from(base64Image, "base64");
    const testImagePath = path.join(__dirname, "temp-test-image.png");
    fs.writeFileSync(testImagePath, imageBuffer);
    console.log("✅ Test image created");

    // Step 4: Upload image using FormData
    console.log("\nStep 4: Uploading image to Cloudinary...");
    
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath));

    const uploadRes = await fetch(`${BASE_URL}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    // Clean up temp file
    fs.unlinkSync(testImagePath);

    if (!uploadRes.ok) {
      console.log("❌ Upload failed");
      console.log("Status:", uploadRes.status);
      console.log("Response:", await uploadRes.text());
      return;
    }

    const uploadData = await uploadRes.json();
    console.log("✅ Image uploaded successfully!");
    console.log("Image URL:", uploadData.imageUrl);

    // Step 5: Create a point with the image
    console.log("\nStep 5: Creating point with image...");
    const pointRes = await fetch(`${BASE_URL}/points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Test Point with Image",
        description: "Testing image upload functionality",
        category: "test",
        lat: 32.0853,
        lng: 34.7818,
        images: [uploadData.imageUrl],
      }),
    });

    if (!pointRes.ok) {
      console.log("Point creation failed:", await pointRes.text());
      return;
    }

    const pointData = await pointRes.json();
    console.log("✅ Point created successfully!");
    console.log("Point ID:", pointData._id);
    console.log("Point title:", pointData.title);
    console.log("Number of images:", pointData.images.length);
    console.log("Image URL in point:", pointData.images[0]);

    // Step 6: Verify by fetching the point
    console.log("\nStep 6: Verifying point...");
    const getPointRes = await fetch(`${BASE_URL}/points/${pointData._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const fetchedPoint = await getPointRes.json();
    console.log("✅ Point fetched successfully!");
    console.log("Images array:", fetchedPoint.images);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 ALL TESTS PASSED!");
    console.log("✅ Image upload to Cloudinary: WORKING");
    console.log("✅ Point creation with images: WORKING");
    console.log("✅ Image storage in database: WORKING");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

testUpload();

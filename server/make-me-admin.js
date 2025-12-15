import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Change this to your email
const EMAIL_TO_PROMOTE = "admin@example.com"; // ← שנה את זה לאימייל שלך

async function updateAdminRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const result = await mongoose.connection.db.collection("users").updateOne(
      { email: EMAIL_TO_PROMOTE },
      { $set: { role: "admin", status: "active" } }
    );
    
    console.log("Update result:", result);
    
    if (result.modifiedCount > 0) {
      console.log(`✅ User ${EMAIL_TO_PROMOTE} role updated to admin`);
    } else if (result.matchedCount > 0) {
      console.log("User found but role was already admin");
    } else {
      console.log(`❌ User ${EMAIL_TO_PROMOTE} not found`);
      console.log("\n📝 Available users:");
      const users = await mongoose.connection.db.collection("users").find({}).toArray();
      users.forEach(u => console.log(`  - ${u.email} (role: ${u.role})`));
    }
    
    // Verify the update
    const user = await mongoose.connection.db.collection("users").findOne({ email: EMAIL_TO_PROMOTE });
    if (user) {
      console.log("\n✅ Current user status:");
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status || 'active'}`);
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("\n🎉 You can now login and access /admin");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

updateAdminRole();

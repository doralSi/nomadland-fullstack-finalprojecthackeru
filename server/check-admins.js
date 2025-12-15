import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");
    
    // Get all users
    const users = await mongoose.connection.db.collection("users").find({}).toArray();
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    // Check for admins
    const admins = users.filter(u => u.role === "admin");
    const mapRangers = users.filter(u => u.role === "mapRanger");
    const regularUsers = users.filter(u => u.role === "user" || !u.role);
    
    console.log("👑 ADMINS:");
    if (admins.length === 0) {
      console.log("   ❌ No admin users found\n");
    } else {
      admins.forEach(u => {
        console.log(`   ✅ ${u.name} (${u.email}) - Status: ${u.status || 'active'}`);
      });
      console.log();
    }
    
    console.log("🗺️  MAP RANGERS:");
    if (mapRangers.length === 0) {
      console.log("   No Map Rangers\n");
    } else {
      mapRangers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Status: ${u.status || 'active'}`);
      });
      console.log();
    }
    
    console.log("👤 REGULAR USERS:");
    if (regularUsers.length === 0) {
      console.log("   No regular users\n");
    } else {
      regularUsers.slice(0, 10).forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Status: ${u.status || 'active'}`);
      });
      if (regularUsers.length > 10) {
        console.log(`   ... and ${regularUsers.length - 10} more\n`);
      } else {
        console.log();
      }
    }
    
    console.log("─────────────────────────────────────────");
    console.log(`Total: ${admins.length} admins, ${mapRangers.length} rangers, ${regularUsers.length} users`);
    console.log("─────────────────────────────────────────\n");
    
    if (admins.length === 0) {
      console.log("💡 To promote a user to admin, run:");
      console.log("   node make-me-admin.js");
      console.log("\n   Or create a new admin:");
      console.log("   node create-admin.js");
      console.log("   node update-admin-role.js");
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAdmins();

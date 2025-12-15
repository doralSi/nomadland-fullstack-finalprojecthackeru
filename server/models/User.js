import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      // Password is required only if no googleId
      return !this.googleId;
    },
  },
  role: {
    type: String,
    enum: ["user", "mapRanger", "admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "frozen"],
    default: "active",
  },
  avatar: {
    type: String,
    default: "",
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  homeRegion: {
    type: String,
    default: "",
  },
  favoritePoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point'
  }],
});

// Helper method to check if user is mapRanger or admin
userSchema.methods.isMapRangerOrAdmin = function() {
  return this.role === "mapRanger" || this.role === "admin";
};

export default mongoose.model("User", userSchema);

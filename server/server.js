import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pointRoutes from "./routes/pointRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import regionRoutes from "./routes/regionRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/regions", regionRoutes);

console.log("✅ Auth routes registered at /api/auth");
console.log("✅ Point routes registered at /api/points");
console.log("✅ Upload routes registered at /api/upload");
console.log("✅ Region routes registered at /api/regions");

// בדיקה שהשרת רץ
app.get("/", (req, res) => {
  res.send("NomadLand API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

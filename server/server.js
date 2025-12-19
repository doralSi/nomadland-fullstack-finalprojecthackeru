import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pointRoutes from "./routes/pointRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import regionRoutes from "./routes/regionRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import personalMapRoutes from "./routes/personalMapRoutes.js";
import mapRangerRoutes from "./routes/mapRangerRoutes.js";
import languageTestRoutes from "./routes/languageTestRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testEmailRoutes from "./routes/testEmailRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth routes: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per windowMs
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger
app.use(generalLimiter); // Apply general rate limiting to all routes

// Debug middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authLimiter, authRoutes); // Apply strict rate limiting to auth
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/personal-maps", personalMapRoutes);
app.use("/api/map-ranger", mapRangerRoutes);
app.use("/api/languages", languageTestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test-email", testEmailRoutes);

console.log("✅ Auth routes registered at /api/auth");
console.log("✅ Google auth routes registered at /api/auth/google");
console.log("✅ User routes registered at /api/users");
console.log("✅ Point routes registered at /api/points");
console.log("✅ Upload routes registered at /api/upload");
console.log("✅ Region routes registered at /api/regions");
console.log("✅ Event routes registered at /api/events");
console.log("✅ Review routes registered at /api/reviews");
console.log("✅ Personal map routes registered at /api/personal-maps");
console.log("✅ Map Ranger routes registered at /api/map-ranger");
console.log("✅ Language test routes registered at /api/languages");
console.log("✅ Admin routes registered at /api/admin");

// בדיקה שהשרת רץ
app.get("/", (req, res) => {
  res.send("NomadLand API is running 🚀");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to DB first, then start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer();

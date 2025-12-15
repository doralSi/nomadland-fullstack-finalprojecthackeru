import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getStats,
  getUsers,
  getPoints,
  getEvents,
  freezeUser,
  unfreezeUser,
  deleteUser,
  deletePoint,
  deleteEvent,
  promoteToMapRanger,
  demoteFromMapRanger
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// Dashboard stats
router.get("/stats", getStats);

// Users management
router.get("/users", getUsers);
router.put("/users/:id/freeze", freezeUser);
router.put("/users/:id/unfreeze", unfreezeUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/promote", promoteToMapRanger);
router.put("/users/:id/demote", demoteFromMapRanger);

// Points management
router.get("/points", getPoints);
router.delete("/points/:id", deletePoint);

// Events management
router.get("/events", getEvents);
router.delete("/events/:id", deleteEvent);

export default router;

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Protected profile route",
        user: req.user
    });
});

router.put("/profile", authMiddleware, updateUserProfile);

router.get("/admin", authMiddleware, isAdmin, (req, res) => {
    res.json({
        message: "Admin access granted",
        user: req.user
    });
});

export default router;
